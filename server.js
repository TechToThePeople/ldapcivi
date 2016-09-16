var ldap = require('ldapjs');
var _ = require('underscore');
if (process.argv.length >= 3) {
console.log ("Using config file config/"+process.argv[2]+'.js');
  //var settings = _.defaults(require('./config/'+process.argv[2]+'.js'),require('./config/default.js'));
  var settings = {};
  _.defaults(settings,require('./config/default.js'),require('./config/'+process.argv[2]+'.js'));
  _.extend(settings.civicrm,require('./config/default.js').civicrm,require('./config/'+process.argv[2]+'.js').civicrm);
  _.extend(settings.ldap,require('./config/default.js').ldap,
     require('./config/'+process.argv[2]+'.js').ldap);
} else {
  console.log ("No setting param given. Using default configuration");
  var settings = require('./config/default.js');
}

// NB: passing settings.ldap makes it possible to enable ldaps.
var server = ldap.createServer(settings.ldap);
var crmAPI = require('civicrm')(settings.civicrm);

//server.use(function(req, res, next) { console.log(req); return next(); });
//ldap.log4js.setLevel('Trace');

// Uncomment this if you want to settings on the console.
// NB: if you are using SSL, the private key will be printed on the console.
// console.log (settings.ldap);

server.bind(settings.ldap.basedn, function (req, res, next) {
  var username = req.dn.toString(),
  password = req.credentials;
  console.log ("bind "+username+":"+password);
  if ( password != settings.ldap.password  ) {
    console.log ("invalid password");
    return next(new ldap.InvalidCredentialsError());
  }
  res.end();
  return next();
});

//http://ldapjs.org/server.html authorize()
server.search("", function(req, res, next) {
  console.log(req.connection.ldap.bindDN.toString());
//  if (!req.connection.ldap.bindDN.equals('cn=root'))
//    return next(new ldap.InsufficientAccessRightsError());
  return next(new ldap.OperationsError());
  res.end();
});

server.search(settings.ldap.SUFFIX, function(req, res, next) {
  var dummy = { dn: req.dn.toString(),  attributes: {  objectclass: ['inetOrgPerson', 'top'], o: 'example', sn:'last name', cn:'first last'}};
  var noimpl = { dn: req.dn.toString(),  attributes: {  objectclass: ['inetOrgPerson', 'top'], o: 'Tech To The People', mail:'sponsor.ldap@tttp.eu', cn:'Not Implemented'}};

  var params = {
    contact_type:'Individual',
    "return":'display_name,sort_name,first_name,last_name,email,title,organization_name,current_employer,job_title,phone,street_address,supplemental_address_1,city,state_province,postal_code,country',
    "option.limit" : req.sizeLimit,
  };

  console.log ("searching "+req.sizeLimit);
  console.log(req.attributes);

  function civicrm_contact_search (name,result) {
    console.log ("searching "+ name);
    params.sort_name = name;
    crmAPI.call ('contact',settings.civicrm.action,params,
      function (data) {
        if (data.is_error) {
          result (1,data);
        }
        result (data.is_error,data.values);
    });
  }


  function extractQuery (filter) {
    var q= query.filters[0].json;
    q.type = undefined;//don't need it
    for (i in q) {
      if (typeof q[i] == "string"){
        q=q[i];
        continue;
      } else if (typeof q[i] == "object") {
        q= q[i][0];
        continue;
      }
    }
    return q;
  }

  function formatContact (contact) {
    var map = {
      'mail':'email',
      'givenname':'first_name',
      'sn':'last_name',
      'title':'job_title',
      'co':'country',
      'l':'city',
      'st':'state_province',
      'street':'street_address',
      'postaladdress':'street_address',
      'postalcode':'postal_code',
      'telephonenumber':'phone',
      'o':'current_employer',
      'company':'current_employer',
      'displayName':'display_name',
    }

    var contactUrl = settings.civicrm.server +"/civicrm/contact/view?reset=1&cid="+ contact.id;
    switch (settings.civicrm.cms) {
      case 'Joomla':
        contactUrl = settings.civicrm.server +"/administrator/?option=com_civicrm&task=civicrm/contact/view&reset=1&cid="+ contact.id;
        break;
      case 'WordPress':
        contactUrl = settings.civicrm.server +"/wp-admin/admin.php?page=CiviCRM&q=civicrm/contact/view&reset=1&cid="+ contact.id;
        break;
      // already done for Drupal
    }

    var r= {'objectClass':["top","inetOrgPerson","person"],'cn':contact.sort_name,'homeurl':contactUrl};
    for (v in map){
      if (typeof contact[map[v]] != "undefined") {
        r[v] = contact[map[v]];
      }
    }
    if (typeof contact["supplemental_address_1"] != "undefined" && contact["supplemental_address_1"].length > 0) {
      r['postaladdress']=r['postaladdress']+", "+contact["supplemental_address_1"];
    }
    if (typeof contact["supplemental_address_2"] != "undefined" && contact["supplemental_address_2"].length > 0) {
      r['postaladdress']=r['postaladdress']+", "+contact["supplemental_address_2"];
    }
    r['info']='CiviCRM contact record: ' + contactUrl;
    return {'dn':'cn=civi_'+contact.id+', '+settings.ldap.basedn,'attributes':r};
  }

  var dn = req.dn.toString();
  query= req.filter.json;
  console.log( "query DN = " + dn + ' '+ req.scope + ' / ' + query.type);

  if (query.type == "PresenceMatch") {
    //do something
    var cid=req.dn.rdns[0].attrs.cn.value.substring(5);
    crmAPI.call ('contact','get',{id:cid,"option.limit":1,return:"first_name,last_name,email,current_employer,prefix_id,gender_id,street_address,supplemental_address_1,supplemental_address_2,city,postal_code,state_province,country,phone,job_title"},
      function (data) {
        if (data.is_error) {
          res.end();
          return next();
        }
         res.send(formatContact(data.values[0]));
         res.end();
    });
    return next();
  }

  if (req.scope != 'sub') {
    console.log('NOT implemented '+req.scope + ' ' + query.type)
    res.send(noimpl);
    res.end();

  }

  var address = req.filter.toString().match(/\(\w.?=(.*?)\*\)/);

  if (! address) {
    console.log('Invalid query format. Make sure it has no spaces and correct use of parenthesis. It should match: /\(\w.?=(.*?)\*\)/');
    return next(new ldap.NoSuchAttributeError('invalid query format'));
  }

  if (address.length > 1) {
    address = address[1];
  }
  else {
    address = req.filter.toString().match(/\(\w.?=(.*?)\)/)[1];
  }

  if ("*" == address[0]) {
    address=address.substring(1);
  }

  console.log (req.filter.toString() +"-> searching "+query.type+ " for "  + address);

  civicrm_contact_search (address,function (error,contacts) {
    if (error) {
      // The most typical error is an authentication fail (API key authentication)
      if (contacts) {
        console.log('civicrm_contact_search failed: ' + contacts.error_message);
        return next(new ldap.InvalidCredentialsError(contacts.error_message));
      }
      else {
        // Not sure why, but when there are errors, we often end up here twice,
        // and the second time does not have the actual error provided.
        console.log('civicrm_contact_search failed: ' + 'unknown error');
        return next(new ldap.InvalidCredentialsError('unknown error'));
      }
    }

    for (var i = 0; i < contacts.length; i++) {
       console.log ({'dn': req.dn.toString(), 'attributes':formatContact(contacts[i])});
       res.send(formatContact(contacts[i]));
    }

    res.end();
    return next();
  });
});

server.listen(settings.ldap.port, function() {
  console.log('LDAP server listening at %s', server.url);
});
