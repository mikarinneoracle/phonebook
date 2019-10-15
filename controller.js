app.controller('controller', function($location, $http, $rootScope, $scope, $routeParams)
{
    let ADWBasePath = 'https://m0xcynbe1vuybwv-biketracker.adb.eu-frankfurt-1.oraclecloudapps.com/ords/api/phonebook';
    
	if($location.path() == '/')
	{
		$http.get('https://m0xcynbe1vuybwv-biketracker.adb.eu-frankfurt-1.oraclecloudapps.com/ords/api/phonebook/all/').success(function(response, err) {
			$scope.persons = response['items'];
            console.log($scope.persons);
		});
	}

    if ($routeParams.id) {
        // Edit
        $http.get(ADWBasePath + '/get/' + $routeParams.id).success(function(response, err) {
            $scope.person = response['items'][0];
            $rootScope.id = $routeParams.id;
            console.log($rootScope.id);
        });
	} else {
        // Add
        $rootScope.id = null;
        $scope.person = {};
	}
    
    $scope.save = function(person) {
        if($rootScope.id)
        {
            if(person.delete)
            {
                console.log("Deleting");
                console.log(person);
                $http.delete(ADWBasePath + '/delete/' + $rootScope.id)
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
            } else {
                console.log("Saving");
                console.log(person);
                $http.post(ADWBasePath + '/update/' + $rootScope.id, person)
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
            $http.post(ADWBasePath + '/insert/', person)
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
