(function (angular) {
  "use strict";

  var app = angular.module('eNutri.account', ['backend.utils','ngRoute']);

  app.controller('AccountCtrl', ['$scope', 'BEutil', '$location',
    function($scope, BEutil, $location) {
      
      // Hide everything until the user profile is loaded
      $scope.showContent=false;
      BEutil.BEWait(false,true,false).then(() => $scope.$evalAsync(runMenu));

      function runMenu(){
        if(BEutil.signed_in) $scope.showContent=true;
        else $location.path('/home');
        $scope.profile= BEutil.BEUser;

        // expose logout function to scope
        $scope.logout = function()
        {
          // Log out and return to home
          BEutil.sign_out().then(() => $scope.$evalAsync(()=>
            {
              $scope.$emit('menu_update_needed');
              $location.path('/home');
            }));
          
        }

        $scope.changePassword = function(pass, confirm, newPass) {
          resetMessages();
          if( !pass || !confirm || !newPass ) {
            $scope.err = 'Please fill in all password fields';
          }
          else if( newPass !== confirm ) {
            $scope.err = 'New pass and confirm do not match';
          }
          else {
            var user = BEutil.BEUser;
            user.set("password",newPass);
            user.save().then(() => $scope.$evalAsync(function() {
              $scope.msg = 'Password changed';
            }), function(err) {() => $scope.$evalAsync(() =>
              $scope.err = err)
            })
          }
        };

        $scope.clear = resetMessages;

        $scope.changeEmail = function(pass, newEmail) {
          resetMessages();
          var user = BEutil.BEUser;
          user.set("username",newEmail)
          .then(function() {
            $scope.emailmsg = 'Email changed';
            $scope.profile= BEutil.BEUser;
          }, function(err) {
            $scope.emailerr = err;
          });
        };

        function resetMessages() {
          $scope.err = null;
          $scope.msg = null;
          $scope.emailerr = null;
          $scope.emailmsg = null;
        }


        $scope.email = null;
        $scope.pass = null;
        $scope.confirm = null;
        $scope.createMode = false;

        $scope.message = null;
        $scope.error = null;

        //TODO mail-reset?
        $scope.resetPassword = function() {
          $scope.message = null;
          $scope.error = null;
        };

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
      }
    }
  ]);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/account', {
      templateUrl: 'account/account.html',
      controller: 'AccountCtrl'
    });
  }]);

})(angular);
