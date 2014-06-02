ldapcivi
========

Allows you to search your civicrm install directly from your mail client (Thunderbird, Zimbra, Outlook or Mac Contacts App for now)


Requirements
-------

Your LDAP server and CiviCRM server do not need to be in the same place. You will need a server capable of running node.js, if your current hosting doesn't allow for this, something like Amazon Web Services may be a low cost solution, see this blog post for details on that - http://civicrm.org/blogs/chrischinchilla/civicrm-and-ldap%E2%80%A6-journey.

You might also need to read up on LDAP, here's a good start - http://php.net/manual/en/intro.ldap.php.


Install
-------

    $ git clone https://github.com/TechToThePeople/ldapcivi.git
    $ npm install
    $ cp config/default.js config/yoursite.js //Name of your site replaces 'yoursite'
    $ edit config/yoursite.js //change the config to your requirements

Run
-------

Ensure you are in the 'ldapcivi' directory, then run:

    $ node server.js yoursite


On the CiviCRM side
-------
You may want to install the 'eu.tttp.qlookup' extension to provide a better contact lookup and thus the api function contact.getttpquick. However, the default CiviCRM contact search can be used instead, see the settings file.

settings.civicrm.action="getttpquick"

You can install the extension directly from the "Manage extensions" section from within your CiviCRM, or you can get more information from the CiviCRM extensions directory: https://civicrm.org/extensions/quick-contact-autocomplete


Use from Thunderbird
-------
Set up the same ldap.civ.im, port, base DN (SUFFIX in the config) and Bind DB as you have in your config
for the login, put whatever you want. for the password, put the one on the config

Mozilla Thunderbird is a good starting point for testing, however to make it most useful, turn on LDAP debugging so you can see what was going on. You do this by following the instructions here (http://wiki.dovecot.org/Debugging/Thunderbird), but change NSPR_LOG_MODULES=IMAP:5 to NSPR_LOG_MODULES=LDAP:5.

To get the Thunderbird address book to recognise the new LDAP server settings use something along the lines of the following in the new address book settings:

* Name - Up to you
* Hostname - LDAP Server name
* Base DN - As defined in 'settings.ldap.basedn'
* Port - 1389
* Bind DN - cn=root,followed by string defined in 'settings.ldap.SUFFIX'

You may be asked for a password, use the one defined in 'settings.ldap.password'.

Use from Zimbra
---------------

Go to the administrative interface of Zimbra (https://example.org:7071/zimbraAdmin),
then go to "Configure" > "Domains". Right-click on your domain and select "Configure
GAL" (Global Address List).

* GAL mode: external
* Server type: LDAP
* Enter the LDAP server in the ldap://[...] and port.
* Recommended LDAP filter: (|(cn=*%s*)(mail=*%s*))
* Autocomplete filter: (|(cn=*%s*)(sn=*%s*)(gn=*%s*)(mail=*%s*))
* LDAP search base: as defined in 'settings.ldap.basedn'

Click "Next", the DN settings can be left empty, "next", leave the "Use GAL
search settings for GAL sync", "next", test your settings by doing a real
search. If there are any errors, look at the output of the nodejs program on
your server.

Afterwards, you can test the autocomplete when writing new messages. Note that
by default the address field will try to match only the e-mail address.
Click on the "To" label to open the contact address book, and from there it
will do wildcard searches.

Use from Outlook
-------
Same as thunderbird, but the login has to be 
cn=nicolas, dc=example, dc=org (or whatever your bind DN)


Use from Mac Contacts
-------
In Preferences -> Accounts, create a new LDAP Server with details along the lines of the following.

* Name - Up to you
* Server - LDAP Server name
* Port - 1389
* Search Base - As defined in 'settings.ldap.SUFFIX'
* Scope - Subtree
* Authentication - Simple
* User name - cn=root,followed by string defined in 'settings.ldap.basedn'
* Password - As set in the config file on your node.js server


Using ldaps (SSL)
-----------------

By default, the communication between your LDAP client and this server is
not encrypted (similar to http). The 'https' equivalent for LDAP is 'ldaps'.

To enable, you must have an SSL key and certificate bundle. This is in the
same format as for most web servers (Apache or Nginx). If your CiviCRM instance
already has https, you can re-use its key and certificate.

You can then add the equivalent configuration to your settings in yoursite.js:

    const fs = require("fs");
    var privateKey = fs.readFileSync('/path/to/www.example.org.key').toString();
    var certificate = fs.readFileSync('/path/to/www.example.org.bundled.crt').toString();

    var settings = {}
    [...]
    settings.ldap.certificate = certificate,
    settings.ldap.key = privateKey,

In the above example,

* "www.example.org" is the site running CiviCRM,
* "/path/to/www.example.org.key" is the file with the SSL private key,
* "/path/to/www.example.org.bundled.crt" is the file with the SSL certificate
  and bundle concatenated together (in that order), as is done usually with nginx.

Some SSL providers refer to the "bundle" as the "chaining certificate".
Apache refers to it as the "SSLCACertificateFile". It is not required, but
most "less expensive" ssl providers require it.

IMPORTANT: keep your SSL private key private! Make sure that other users on your
system cannot read it.

After restarting the ldapcivi server, it should print on the console:

    LDAP server listening at ldaps://0.0.0.0:1389

Note that, by convention, ldaps uses port 636. If you are running ldapcivi as a
non-priviledged user (non-root), you can use 1636, it may be easier to remember
when configuring LDAP clients, since they will automatically default to 636.

As implied above, you will also need to make sure that all LDAP clients support
SSL. If would be highly unusual if your client does not.


Limitations/TODO/Make It Happen
-------
- There is one and only one civicrm backend by ldap server
- There is one and only one civicrm user
- There is one and only one ldap user (same login/pwd for everyone)
- Further documentation on more advanced usage


But instead of limitations, I'd suggest you to see them as opportunities to contribute to the code, or to sponsor them (seriously, probably not that complex)


