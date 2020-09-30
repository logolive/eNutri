(function(angular) {
  "use strict";

  var app = angular.module('eNutri.about', ['backend.utils', 'ngRoute']);

  app.controller('AboutCtrl', ['$scope', 'BEutil',

    function ($scope, BEutil) {

  }]);

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/about', {
      templateUrl: 'about/about.html',
      controller: 'AboutCtrl'
      })
  }]);

})(angular);
