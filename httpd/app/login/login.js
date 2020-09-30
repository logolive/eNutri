"use strict";
angular.module('eNutri.login', ['backend.utils', 'ngRoute','ngMaterial', 'ngMessages'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/login', {
        controller: 'LoginCtrl',
        templateUrl: 'login/login.html'
      });
    }])




    .controller('LoginCtrl', ['$scope', '$location', 'BEutil', function($scope, $location, BEutil) {
      $scope.email = null;
      $scope.pass = null;
      $scope.confirm = null;
      $scope.createMode = false;

      $scope.message = null;
      $scope.error = null;

      $scope.showContent = false;

      BEutil.BEWait(false,true,false).then(() => $scope.$evalAsync(runMenu));
      function runMenu()
      {
        if(!BEutil.signed_in) $scope.showContent = true;
        else $location.path('/account');

        $scope.login = function(email, pass) {
            $scope.err = null;
            BEutil.sign_in(email,pass)
              .then(() => $scope.$evalAsync(()=> {
                $scope.$emit('menu_update_needed');
                $location.path('/account');
              }),
                function(err) {
                  $scope.err = errMessage(err);
              });
        };

        //TODO email-reset
        $scope.resetPassword = function() {
          $scope.message = null;
          $scope.error = null;
          /*
          Auth.$resetPassword({
            email: $scope.email
          }).then(function() {
            $scope.message = "Please check your email for a message from EatWellUK with instructions of how to reset your password";
          }).catch(function(error) {
            $scope.error = error;
          });
          */
        };

        $scope.createAccount = function() {
          $scope.err = null;
          if( assertValidAccountProps() ) {
            var email = $scope.email;
            var pass = $scope.pass;
            BEutil.sign_up(email,pass)
                .then(() => $scope.$evalAsync(()=> {
                  $scope.$emit('menu_update_needed');
                  $location.path('/account');
                }),
                    function(err) {
                      $scope.err = errMessage(err);
                  });
          }
        };
      }


      function assertValidAccountProps() {
        if( !$scope.email ) {
          $scope.err = 'Please enter an email address';
        }
        else if( !$scope.pass || !$scope.confirm ) {
          $scope.err = 'Please enter a password';
        }
        else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
          $scope.err = 'The password you typed does not match what you typed for confirmation.';
        }
        return !$scope.err;
      }

      function errMessage(err) {
        return angular.isObject(err) && err.code? err.code : err + '';
      }

      function firstPartOfEmail(email) {
        return ucfirst(email.substr(0, email.indexOf('@'))||'');
      }

      function ucfirst (str) {
        // inspired by: http://kevin.vanzonneveld.net
        str += '';
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1);
      }


    }]);
