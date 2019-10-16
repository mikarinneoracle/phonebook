var app = angular
  .module('phonebook', [
    'ngRoute',
  ])

  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: './all.html',
        controller: 'controller'
      })
      .when('/:id', {
        templateUrl: './contact.html',
        controller: 'controller'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
