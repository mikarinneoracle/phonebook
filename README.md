# Phonebook ATP ORDS demo

<img src="https://github.com/mikarinneoracle/phonebook/blob/master/screenshot_phonebook.png" width=1200>

## Setup Guide

### NEW! Oracle Digital Assistant Chatbot for Phonebook

Instructions how to set up a Chatbot for the Phonebook is now available at <a href="https://github.com/mikarinneoracle/Phonebookassistant/blob/master/README.md">Phonebookassistant</a>

## Instructions for creating the Phonebook ORDS example using the OCI Resource Manager Stack

Clone/download the `phonebook-stack.zip` and run it with the OCI Resource Manager Stack (Terraform) to create the phonebook app automatically.
It runs on OCI Free Tier, too! `https://www.oracle.com/cloud/free/`

Create a new `stack` from `phonebook-stack.zip` and then choose `Apply` from the dropdown menu.
Wait a while for the job to complete. At the end of the output the Phonebook app url should become visible that points to the `index.html` in the object storage. That is your application, just wait for a minute or two for ORDS being deployed completely.
E.g.
```
Outputs:
autonomous_database_password = j9}l4w%4E2*IYNS<
autonomous_database_phonebook_ords_password = a8OAHjx28wEVmU1fz
comments = To access the Phonebook app please visit: https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/fr2nn14e4hr7/b/phonebook-public-4126/o/index.html - Give it a minute or two for the ORDS to start before trying. 
```
Note: When creating the stack enter the following configuration options:
- ATP database name (defaults to "phonebook")
- configuration VM ssh public key to access the VM for logs etc. (optional)
- configuration VM shape, either Micro (always free) or standard (defaults to Micro)

## Instructions for creating the Phonebook ORDS example manually

### Step 1: Login to SQL Developer Web under ADW/ATP <b>Development</b> tab with the admin user

Then submit the following - replace <i>&lt;your password&gt;</i> with a desired password complex enough:

```
CREATE USER phonebook IDENTIFIED BY <your password>;

GRANT CONNECT, RESOURCE TO phonebook;

ALTER USER phonebook QUOTA UNLIMITED ON DATA;

BEGIN
   ords_admin.enable_schema (
       p_enabled               => TRUE,
       p_schema                => 'phonebook',
       p_url_mapping_type      => 'BASE_PATH',
       p_url_mapping_pattern   => 'api',
       p_auto_rest_auth        => FALSE
   );
   COMMIT;
END;

```

### Step 2: Relogin to SQL Developer Web with the new user phonebook

#### Before logging in replace the "<b><i>admin</i></b>" in the url with "<b><i>api</i></b>" eg.

`https://m0xcynbe1vuybwv-biketracker.adb.eu-frankfurt-1.oraclecloudapps.com/ords/api/_sdw/?nav=worksheet`

This refers to the `p_url_mapping_pattern   => 'api'` in the ords definition in Step 1.

After logging in submit the following:

```
CREATE TABLE users (
     username  VARCHAR2 (255),
     password   VARCHAR2 (255),
     is_admin NUMBER(1,0)
 );
 
INSERT INTO users (username, password, is_admin) VALUES ('phonebook', '<your password>', 1);
 
CREATE TABLE phonebook (
     id         NUMBER GENERATED ALWAYS AS IDENTITY,
     firstname  VARCHAR2 (255),
     lastname   VARCHAR2 (255),
     phonenumber VARCHAR2 (50),
     countrycode VARCHAR2 (10)
 );

CREATE OR REPLACE PROCEDURE ADD_CONTACT (
   uname     IN  VARCHAR2,
   pwd       IN  VARCHAR2,
   firstname    IN  VARCHAR2,
   lastname     IN  VARCHAR2,
   phonenumber  IN  VARCHAR2,
   countrycode  IN  VARCHAR2,
   id           OUT NUMBER
)
AS
   N NUMBER;

BEGIN
   SELECT COUNT(*) INTO N FROM USERS WHERE USERNAME = uname and PASSWORD = pwd and IS_ADMIN = 1;
   IF N > 0 THEN
      INSERT INTO PHONEBOOK (FIRSTNAME, LASTNAME, PHONENUMBER, COUNTRYCODE) values (firstname, lastname, phonenumber, countrycode)
      RETURN ID INTO id;
   ELSE
      id := -1;
   END IF;
  
EXCEPTION
   WHEN OTHERS
   THEN HTP.print(SQLERRM);
END;
/

BEGIN
ords.enable_schema (
         p_enabled               => TRUE,
         p_schema                => 'phonebook',
         p_url_mapping_type      => 'BASE_PATH',
         p_url_mapping_pattern   => 'api',
         p_auto_rest_auth        => TRUE
);
ords.define_module (    
        p_module_name            => 'phonebook',
        p_base_path              => '/phonebook/',
        p_items_per_page         => 5,
        p_status                 => 'PUBLISHED',
        p_comments               => NULL 
);
ords.define_template ( 
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/login/',
        p_priority               => 0,
        p_etag_type              => 'HASH',
        p_etag_query             => NULL, 
        p_comments               => NULL 
);
ords.define_handler (
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/login/',
        p_method                 => 'POST', 
        p_source_type            => 'json/collection',
        p_items_per_page         => 1,
        p_mimes_allowed          => '',
        p_comments               => 'admin login. returns is_admin if user is found with given username and password',
        p_source                 => 'select is_admin from users where username = :username and password = :password'
);
ords.define_template ( 
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/',
        p_priority               => 0,
        p_etag_type              => 'HASH',
        p_etag_query             => NULL, 
        p_comments               => NULL 
);
ords.define_handler (
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/',
        p_method                 => 'GET', 
        p_source_type            => 'json/collection',
        p_items_per_page         => 5,
        p_mimes_allowed          => '',
        p_comments               => 'lists contacts in the phonebook in sets of 5. Use recursively.',
        p_source                 => 'select id, firstname, lastname, firstname || '' '' || lastname as fullname, phonenumber, countrycode from phonebook order by fullname'
);
ords.define_template ( 
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/fullname/:fullname',
        p_priority               => 0,
        p_etag_type              => 'HASH',
        p_etag_query             => NULL, 
        p_comments               => NULL 
);
ords.define_handler (
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/fullname/:fullname',
        p_method                 => 'GET', 
        p_source_type            => 'json/collection',
        p_items_per_page         => 5,
        p_mimes_allowed          => '',
        p_comments               => 'searches for contacts in the phonebook by given name and lists found in sets of 5. Use recursively.',
        p_source                 => 'select id, firstname, lastname, firstname || '' '' || lastname as fullname, phonenumber, countrycode from phonebook where firstname || '' '' || lastname like :fullname order by fullname'
);
ords.define_template ( 
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/:username/:password',
        p_priority               => 0,
        p_etag_type              => 'HASH',
        p_etag_query             => NULL, 
        p_comments               => NULL 
);
ords.define_handler (
        p_module_name           => 'phonebook',
        p_pattern               => 'listing/:username/:password',
        p_method                => 'POST',
        p_source_type           => 'plsql/block',
        p_items_per_page        =>  0,
        p_mimes_allowed         => '',
        p_comments              => 'adds a contact to phonebook from the post data',
        p_source                => 
'
    declare
        -- id NUMBER;
    BEGIN
        ADD_CONTACT(
                uname    => :username,
                pwd     => :password,
                firstname    => :firstname,
                lastname     => :lastname,
                phonenumber  => :phonenumber,
                countrycode  => :countrycode,
                id           => :id);
    commit;
    END;
'
);
ORDS.DEFINE_PARAMETER(
      p_module_name        => 'phonebook',
      p_pattern            => 'listing/:username/:password',
      p_method             => 'POST',
      p_name               => 'id',
      p_bind_variable_name => 'id',
      p_source_type        => 'RESPONSE',
      p_param_type         => 'INT',
      p_access_method      => 'OUT');    
ords.define_template ( 
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/:id',
        p_priority               => 0,
        p_etag_type              => 'HASH',
        p_etag_query             => NULL, 
        p_comments               => NULL 
);
ords.define_handler (
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/:id',
        p_method                 => 'GET', 
        p_source_type            => 'json/collection',
        p_items_per_page         => 1,
        p_mimes_allowed          => '',
        p_comments               => 'gets a contact from phonebook by id',
        p_source                 => 'select firstname, lastname, phonenumber, countrycode from phonebook where id = :id'   
);
ords.define_template ( 
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/:id/:username/:password',
        p_priority               => 0,
        p_etag_type              => 'HASH',
        p_etag_query             => NULL, 
        p_comments               => NULL 
);
ords.define_handler (
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/:id/:username/:password',
        p_method                 => 'PUT', 
        p_source_type            => 'plsql/block',
        p_items_per_page         => 0,
        p_mimes_allowed          => '',
        p_comments               => 'updates a contact in the phonebook by id and post data',
        p_source                 => 'update phonebook set firstname = :firstname, lastname = :lastname, phonenumber = :phonenumber, countrycode = :countrycode
        where id in (
           with c as (select ''X'' as x from users where username = :username and password = :password and is_admin = 1),
               q as (select id,''X'' as x from phonebook where id = :id)
           select id
             from c, q
           where c.x = q.x and q.id = :id
         )'
);
ords.define_handler (
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/:id/:username/:password',
        p_method                 => 'DELETE', 
        p_source_type            => 'plsql/block',
        p_items_per_page         => 0,
        p_mimes_allowed          => '',
        p_comments               => 'deletes a contact in the phonebook by id',
        p_source                 => 'delete from phonebook
        where id in (
           with c as (select ''X'' as x from users where username = :username and password = :password and is_admin = 1),
               q as (select id,''X'' as x from phonebook where id = :id)
           select id
             from c, q
           where c.x = q.x and q.id = :id
         )'
 );
 COMMIT;
 END;
 /
```
### Step 3: Modify the ADW ORDS API reference

In the `Vue.js` modify the line 1 `API` var to match your ADW ORDS instance url.

The easiest way is to copy it from the SQL Developer Web url (see the Step 2) and then modify it slightly.

E.g

```const API = 'https://m0xcynberfeybwv-biketracker.adb.eu-frankfurt-1.oraclecloudapps.com/ords/api/phonebook/listing/';```


### Step 4: Upload to files to OCI object storage and test

Copy the files to object storage and make the container public. 

After uploading access the `index.html` with your browser and test.

