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

var crmAPI = require('civicrm')(settings.civicrm);
var server = ldap.createServer();

//server.use(function(req, res, next) { console.log(req); return next(); });
//ldap.log4js.setLevel('Trace');

server.bind('dc=*', function(req, res, next) {
  console.log ("bind *"+req.dn.toString()+":"+req.credentials);
  res.end();
  return next();
});

server.bind('dc=com', function(req, res, next) {
  console.log ("dc=com bind "+req.dn.toString()+":"+req.credentials);
  res.end();
  return next();
});


server.bind('cn=root', function(req, res, next) {
  console.log ("bind "+req.dn.toString()+":"+req.credentials);
  res.end();
  return next();
});

console.log (settings.ldap);

server.bind(settings.ldap.basedn, function (req, res, next) {
  var username = req.dn.toString(),
  password = req.credentials;
  console.log ("bind "+username+":"+password);
    /*    if (!userinfo.hasOwnProperty(username) ||
          userinfo[username].pwd != password) {
          return next(new ldap.InvalidCredentialsError());
          }
          */
  res.end();
  return next();
});

server.search("a=b", function(req, res, next) {
//console.log(req.baseObject);
console.log("search "+req.dn.toString());
console.log(req.connection.ldap.bindDN);
  res.end();
  return next();
});

server.search(settings.ldap.SUFFIX, function(req, res, next) {
  var dummy = { dn: req.dn.toString(),  attributes: {  objectclass: ['inetOrgPerson', 'top'], o: 'example', sn:'last name', cn:'first last'}};
  var noimpl = { dn: req.dn.toString(),  attributes: {  objectclass: ['inetOrgPerson', 'top'], o: 'Tech To The People', mail:'sponsor.ldap@tttp.eu', cn:'Not Implemented'}};

  function civicrm_contact_search (name,result) {
    console.log ("searching "+ name);
    crmAPI.call ('contact',settings.civicrm.action,{sort_name:name,contact_type:'Individual',return:'display_name,email'},
      function (data) {
        console.log(data);
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
      'mail':'email',
      'sn':'last_name',
      'o':'organization_name',
    }
    var r= {'objectClass':["top","inetOrgPerson"],'cn':contact.sort_name};
    for (v in map){
      if (typeof contact[map[v]] != "undefined") {
        r[v] = contact[map[v]];
      }
    }
    return {'dn':'cn=civi_'+contact.id+', '+settings.ldap.basedn,'attributes':r};
  }

  var dn = req.dn.toString();
  query= req.filter.json;
  console.log( "query DN = " + dn + ' '+ req.scope + ' / ' + query.type);
  if (req.scope != 'sub') {
    console.log('NOT implemented '+req.scope + ' ' + query.type)
    res.send(noimpl);
    res.end();

  }

  var address = req.filter.toString().match(/\(\w.?=(.*?)\*\)/);
  if (address.length >1)
    address = address[1];
  else 
    address = req.filter.toString().match(/\(\w.?=(.*?)\)/)[1];
  if ( "*" == address[0])
    address=address.substring(1);
  console.log (req.filter.toString() +"-> searching "+query.type+ " for "  + address); 
  civicrm_contact_search (address,function (error,contacts) {
console.log(error);
console.log(contacts);
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

