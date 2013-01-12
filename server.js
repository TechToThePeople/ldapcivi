var ldap = require('ldapjs');
var _ = require('underscore');
if (process.argv.length >= 3) {
  var settings = _.extend(require('./config/default.js'),require('./config/'+process.argv[2]+'.js'));
} else {
  var settings = require('./config/default.js');
}

var crmAPI = require('civicrm')(settings.civicrm);
var server = ldap.createServer();

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

server.search(settings.ldap.basedn, function(req, res, next) {
  var dummy = { dn: req.dn.toString(),  attributes: {  objectclass: ['inetOrgPerson', 'top'], o: 'example', sn:'last name', cn:'first last'}};
  var noimpl = { dn: req.dn.toString(),  attributes: {  objectclass: ['inetOrgPerson', 'top'], o: 'Tech To The People', mail:'sponsor.ldap@tttp.eu', cn:'Not Implemented'}};

  function civicrm_contact_search (name,result) {
    crmAPI.get ('contact',{sort_name:name,contact_type:'Individual',return:'display_name,email,phone'},
      function (data) {
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
  console.log (req.filter.toString() +"-> searching "+query.type+ " for "  + address); 
  civicrm_contact_search (address,function (error,contacts) {
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

