var settings = {}

settings.ldap = {}
settings.ldap.SUFFIX = 'o=tttp';
settings.ldap.basedn = "dc=example, dc=com",
settings.ldap.company = "Example",
settings.ldap.port = 1389,

settings.civicrm = {}
settings.civicrm.server ="http://www.example.org"
settings.civicrm.path = "/sites/all/modules/civicrm/extern/rest.php",
settings.civicrm.api_key="your api key"
settings.civicrm.key="yours site key"

module.exports = settings;
