ldapcivi
========

Allows you to search your civicrm install directly from your mail client (thunderbird, outlook or Mac Contacts App for now)


Requirements
-------
Your LDAP server and CiviCRM server do not need to be in the same place. You will need a server capable of running node.js, if your current hosting doesn't allow for this, something like Amazon Web Services may be a low cost solution, see this blog post for details on that - http://civicrm.org/blogs/chrischinchilla/civicrm-and-ldap%E2%80%A6-journey.

You might also need to read up on LDAP, here's a good start - http://php.net/manual/en/intro.ldap.php.


Install
-------
$git clone https://github.com/TechToThePeople/ldapcivi.git
$npm install
$cp config/default.js config/yoursite.js //Name of your site replaces 'yoursite'
$edit config/yoursite.js //change the config to your requirements


Run
-------
Ensure you are in the 'ldapcivi' directory.
node server.js yoursite


On the CiviCRM side
-------
You may want to install the 'eu.tttp.qlookup' extension to provide a better contact lookup and thus the api function contact.getttpquick. However, the default CiviCRM contact search can be used instead, see the settings file.

settings.civicrm.action="getttpquick"


Use from Thunderbird
-------
Set up the same ldap.civ.im, port, base DN (SUFFIX in the config) and Bind DB as you have in your config
for the login, put whatever you want. for the password, put the one on the config

Mozilla Thunderbird is a good starting point for testing, however to make it most useful, turn on LDAP debugging so you can see what was going on. You do this by following the instructions here (http://wiki.dovecot.org/Debugging/Thunderbird), but change NSPR_LOG_MODULES=IMAP:5 to NSPR_LOG_MODULES=LDAP:5.

To get the Thunderbird address book to recognise the new LDAP server settings use something along the lines of the following in the new address book settings:

Name - Up to you
Hostname - LDAP Server name
Base DN - As defined in 'settings.ldap.basedn'
Port - 1389
Bind DN - cn=root,followed by string defined in 'settings.ldap.SUFFIX'

You may be asked for a password, use the one defined in 'settings.ldap.password'.


Use from Outlook
-------
Same as thunderbird, but the login has to be 
cn=nicolas, dc=example, dc=org (or whatever your bind DN)


Use from Mac Contacts
-------
In Preferences -> Accounts, create a new LDAP Server with details along the lines of the following.

Name - Up to you
Server - LDAP Server name
Port - 1389
Search Base - As defined in 'settings.ldap.SUFFIX'
Scope - Subtree
Authentication - Simple
User name - cn=root,followed by string defined in 'settings.ldap.basedn'
Password - As set in the config file on your node.js server


Limitations/TODO/Make It Happen
-------
- There is one and only one civicrm backend by ldap server
- There is one and only one civicrm user
- There is one and only one ldap user (same login/pwd for everyone)
- Further documentation on more advanced usage


But instead of limitations, I'd suggest you to see them as opportunities to contribute to the code, or to sponsor them (seriously, probably not that complex)


