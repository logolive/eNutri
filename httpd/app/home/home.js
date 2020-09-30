(function(angular) {
  "use strict";

  var app = angular.module('eNutri.home', ['backend.utils', 'ngRoute']);

  app.controller('HomeCtrl', ['$scope', 'BEutil', '$location',
    function ($scope, BEutil, $location) {
      $scope.showContent=false;
      $scope.refConfig=null;
      
      BEutil.BEWait(true,true,false).then(() => $scope.$evalAsync(runMenu));

      function runMenu()
      {
        if(BEutil.signed_in) $location.path('/account');

        $scope.showContent=true;
        $scope.refConfig=BEutil.BEConfig;
      }

  }]);


  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'home/home.html',
      controller: 'HomeCtrl'
    });
  }]);

})(angular);
