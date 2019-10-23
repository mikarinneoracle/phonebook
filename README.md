# Phonebook ADW ORDS demo

## Setup Guide

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

This refers to the `p_url_mapping_pattern   => 'api'` in the <ords definition in Step 1.

After logging in submit the following:

```
drop table phonebook;

CREATE TABLE phonebook (
     id         NUMBER GENERATED ALWAYS AS IDENTITY,
     firstname  VARCHAR2 (255),
     lastname   VARCHAR2 (255),
     phonenumber VARCHAR2 (50),
     countrycode VARCHAR2 (10),
     CONSTRAINT phonebook_pk PRIMARY KEY (id)
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
        p_source                 => 'select id, firstname || '' '' || lastname as fullname, phonenumber, countrycode from phonebook order by fullname' 
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

In the `controller.js` modify the line 3 `API` var to match your ADW ORDS instance url.

I.e.

```let API = 'https://m0xcynberfeybwv-biketracker.adb.eu-frankfurt-1.oraclecloudapps.com/ords/api/phonebook/listing/';```


### Step 4: Upload to files to OCI object storage and test

Copy the files to object storage and make the container public. 

After uploading access the `index.html` with your browser and test.

