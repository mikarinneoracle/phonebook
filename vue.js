const API = 'https://udedvammm0sarjj-atp.adb.eu-frankfurt-1.oraclecloudapps.com/ords/api/phonebook/listing/';

var offset = 0;
var data = { persons : [],
             msg : '',
             search: '',
             person: {},
             state: 0, CONTACTS : 1, ADD_CONTACT : 2, EDIT_CONTACT : 3
           };

var phonebook = new Vue({
  el: '#phonebook',
  data: { data },
  mounted () {
      
    data.state=data.CONTACTS;
    data.person = {};
    data.persons = [];
    getListing();
  },
  computed: {
      filteredPersons: function () {
        return data.persons.filter(function (person) {
            return person.fullname.toUpperCase().includes(data.search.toUpperCase());
        })
    }
  },
  methods:{
    addContact: function (e) {
      data.msg = "Saving a new contact ..";
      addContact();
      e.preventDefault();
    },
    saveContact: function (e) {
      data.msg = "Saving contact ..";
      saveContact();
      e.preventDefault();
    },
    deleteContact: function (e) {
      if(confirm("Delete contact " + data.person.fullname + " ?"))
      {
            data.msg = "Deleting contact ..";
            deleteContact();
      }
      e.preventDefault();
    },
    newContact: function (e) {
      data.person = {};
      data.state=data.ADD_CONTACT;
      e.preventDefault();
    },
    editContact: function (e, id) {
      data.person = {};
      // Locate person by id from data; we don't have to get it via REST
      for(var i = 0; i < data.persons.length; i++)
      {
           if(data.persons[i].id == id)
           {
               data.person = data.persons[i];
               break;
           }
      }
      data.state=data.EDIT_CONTACT;
      e.preventDefault();
    }
  }
})

function addContact() {
    axios
      .post(API, data.person)
      .then(response => 
            {
                data.msg = "";
                data.state = data.CONTACTS;
                data.persons = [];
                offset = 0;
                getListing();
            }
        )
     .catch(error => {
            alert(error);
            console.log(error)
        })
}

function saveContact() {
    axios
      .put(API + data.person.id, data.person)
      .then(response => 
            {
                data.msg = "";
                data.state = data.CONTACTS;
                data.persons = [];
                offset = 0;
                getListing();
                console.log(response);
            }
        )
     .catch(error => {
            alert(error);
            console.log(error)
        })
}

function deleteContact() {
    axios
      .delete(API + data.person.id)
      .then(response => 
            {
                data.msg = "";
                data.state = data.CONTACTS;
                data.persons = [];
                offset = 0;
                getListing();
            }
        )
     .catch(error => {
            alert(error);
            console.log(error)
        })
}

function getListing(callback) {
    data.msg = "Loading listing ..";
    axios
      .get(API + '?offset=' + offset)
      .then(response => 
            {        
                var items = response.data.items;
                for(var i = 0; i < items.length; i++)
                {
                   data.persons.push(items[i]);
                }
                if(response.data.hasMore)
                {
                    offset =+ response.data.count;
                    return getListing(callback);
                } else {
                    data.msg = "";
                    return callback;
                }
            }
        )
     .catch(error => {
            console.log(error)
        })
     .finally(() => { 
            console.log("contacts loaded: " + data.persons.length) 
        })
}
