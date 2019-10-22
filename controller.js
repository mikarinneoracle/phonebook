app.controller('controller', function ($location, $http, $rootScope, $scope, $routeParams)
{   
    const API = 'https://m0xcynbe1vuybwv-biketracker.adb.eu-frankfurt-1.oraclecloudapps.com/ords/api/phonebook/listing/';
    
    
	if($location.path() == '/')
	{
        $rootScope.offset = 0;
        $scope.persons = [];
		getListing();
	} else if($location.path() == '/add')
    {
        // Add
        $rootScope.id = null;
        $scope.person = {};
    } else if ($routeParams.id) {
        // Edit
        $http.get(API + $routeParams.id).success(function(response, err) {
            $scope.person = response['items'][0];
            $rootScope.id = $routeParams.id;
            console.log($rootScope.id);
        });
	} else {
        var location = '/';
        $location.path(location);
	}
    
    function getListing(callback) {
        $rootScope.message = "Retrieving phonebook ..";
        $http.get(API + '?offset=' + $rootScope.offset)
            .success(function(response, err) {
                var items = response['items'];
                console.log(items);
                for(var i = 0; i < items.length; i++)
                {
                    $scope.persons.push(items[i]);
                }
                if(response['hasMore'])
                {
                    $rootScope.offset = $rootScope.offset + response['count'];
                    console.log($rootScope.offset);
                    return getListing(callback);
                } else {
                    $rootScope.message = null;
                    return callback;
                }
            })
           .error(function(response, err) {
                console.log(err);
            })
    }
    
    $scope.save = function(person) {
        if($rootScope.id)
        {
            if(person.delete)
            {
                console.log("Deleting");
                console.log(person);
                if(confirm("Delete " + person.firstname + " " + person.lastname + " ?"))
                {
                    $http.delete(API + $rootScope.id)
                    .success(function(response, err) {
                        $rootScope.id = null;
                        var location = '/';
                        $location.path(location);
                        return;
                    })
                    .error(function(response, err) {
                        $rootScope.id = null;
                        //alert(response.error);
                        var location = '/';
                        $location.path(location);
                        return;
                    })
                }
            } else {
                console.log("Saving");
                console.log(person);
                $http.put(API + $rootScope.id, person)
                .success(function(response, err) {
                    $rootScope.id = null;
                    var location = '/';
                    $location.path(location);
                    return;
                })
                .error(function(response, err) {
                    $rootScope.id = null;
                    //alert(response.error);
                    var location = '/';
                    $location.path(location);
                    return;
                })   
            }
        } else {
            console.log("Adding");
            console.log(person);
            $http.post(API, person)
            .success(function(response, err) {
                $rootScope.id = null;
                var location = '/';
                $location.path(location);
                return;
            })
            .error(function(response, err) {
                $rootScope.id = null;
                //alert(response.error);
                var location = '/';
			    $location.path(location);
                return;
            })   
        }
	}

});
