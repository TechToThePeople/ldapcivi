var settings = {}

settings.ldap = {}
settings.ldap.SUFFIX = '';
settings.ldap.basedn = "dc=*", // "cn=root" another alternative
settings.ldap.company = "Example",
settings.ldap.port = 1389, // 389 is the ldap port, but needs to run as root (priviledged port 

settings.civicrm = {}
settings.civicrm.server ="http://www.example.org"
settings.civicrm.path = "/sites/all/modules/civicrm/extern/rest.php",
settings.civicrm.api_key="your api key"
settings.civicrm.key="yours site key"

settings.civicrm.action="get"

module.exports = settings;
