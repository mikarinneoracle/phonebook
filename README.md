# Phonebook ADW ORDS demo

## Setup Guide

### NEW! OCI Resource Manager Stack

Clone/download the `phonebook-stack.zip` and run it with the OCI Resource Manager Stack (Terraform) to create the phonebook app automatically.
It runs on OCI Free Tier, too! `https://www.oracle.com/cloud/free/`

#### Instructions:

Create a new `stack` from `phonebook-stack.zip` and then choose `Apply` from the dropdown menu.
Wait a while for the job to complete. At the end of the output the Phonebook app url should become visible that points to the `index.html` in the object storage. That is your application, just wait for a minute or two for ORDS being deployed completely.
E.g.
```
Outputs:
autonomous_database_password = j9}l4w%4E2*IYNS<
autonomous_database_phonebook_ords_password = a8OAHjx28wEVmU1fz
comments = To access the Phonebook app please visit: https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/fr2nn14e4hr7/b/phonebook-public-4126/o/index.html - Give it a minute or two for the ORDS to start before trying. 
```

### Step 1: Login to SQL Developer Web under ADW/ATP <b>Development</b> tab with the admin user

Then submit the following:

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
drop table phonebook;

CREATE TABLE phonebook (
     id         NUMBER GENERATED ALWAYS AS IDENTITY,
     firstname  VARCHAR2 (255),
     lastname   VARCHAR2 (255),
     phonenumber VARCHAR2 (50),
     countrycode VARCHAR2 (10)
 );

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
ords.define_handler (
        p_module_name           => 'phonebook',
        p_pattern               => 'listing/',
        p_method                => 'POST',
        p_source_type           => 'plsql/block',
        p_items_per_page        =>  0,
        p_mimes_allowed         => '',
        p_comments              => 'adds a contact to phonebook from the post data',
        p_source                => 'insert into phonebook (firstname, lastname, phonenumber, countrycode) VALUES (:firstname, :lastname, :phonenumber, :countrycode)'
);
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
ords.define_handler (
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/:id',
        p_method                 => 'PUT', 
        p_source_type            => 'plsql/block',
        p_items_per_page         => 0,
        p_mimes_allowed          => '',
        p_comments               => 'updates a contact in the phonebook by id and post data',
        p_source                 => 'update phonebook set firstname = :firstname, lastname = :lastname, phonenumber = :phonenumber, countrycode = :countrycode where id = :id' 
);
ords.define_handler (
        p_module_name            => 'phonebook',
        p_pattern                => 'listing/:id',
        p_method                 => 'DELETE', 
        p_source_type            => 'plsql/block',
        p_items_per_page         => 0,
        p_mimes_allowed          => '',
        p_comments               => 'deletes a contact in the phonebook by id',
        p_source                 => 'delete from phonebook where id = :id'
 );
 COMMIT;
 END;
```
### Step 3: Modify the ADW ORDS API reference

In the `Vue.js` modify the line 1 `API` var to match your ADW ORDS instance url.

The easiest way is to copy it from the SQL Developer Web url and modify it slightly.

E.g

```const API = 'https://m0xcynberfeybwv-biketracker.adb.eu-frankfurt-1.oraclecloudapps.com/ords/api/phonebook/listing/';```


### Step 4: Upload to files to OCI object storage and test

Copy the files to object storage and make the container public. 

After uploading access the `index.html` with your browser and test.

