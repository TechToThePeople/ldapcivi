ldapcivi
========

Allows you to search your civicrm install directly from your mail client (thunderbird or outlook)

Install
-------
git clone this repository
copy config/default.js into config/yoursite.js

edit config/yoursite.js with your setting

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
