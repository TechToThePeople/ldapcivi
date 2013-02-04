ldapcivi
========

Allows you to search your civicrm install directly from your mail client (thunderbird or outlook)

Install
-------
$git clone https://github.com/TechToThePeople/ldapcivi.git

$npm install

$cp config/default.js config/yoursite.js

$edit config/yoursite.js //put the config you like

Run
---
node server.js yoursite

On the CiviCRM side
-----------------
you need to install an extension to provide the api contact.getttpquick
settings.civicrm.action="getttpquick"


Use from Thunderbird
------------------
Set up the same ldap.civ.im, port, base DN (SUFFIX in the config) and Bind DB as you have in your config
for the login, put whatever you want. for the password, put the one on the config

Use from Outlook
-----------------
Same as thunderbird, but the login has to be 
cn=nicolas, dc=example, dc=org (or whatever your bind DN)

Limitations/TODO/Make It Happen
---------------
- There is one and only one civicrm backend by ldap server
- There is one and only one civicrm user
- There is one and only one ldap user (same login/pwd for everyone)

But instead of limitations, I'd suggest you to see them as opportunities to contribute to the code, or to sponsor them (seriously, probably not that complex)


