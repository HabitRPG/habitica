"use strict";

/*
 The authentication controller (login & facebook)
 */

habitrpg.controller("AuthCtrl", ['$scope', '$rootScope', 'User', '$http', '$location', '$window','API_URL',
  function($scope, $rootScope, User, $http, $location, $window, API_URL) {
    var runAuth;
    var showedFacebookMessage;

    $scope.useUUID = false;
    $scope.toggleUUID = function() {
      if (showedFacebookMessage === false) {
        alert("Until we add Facebook, use your UUID and API Token to log in (found at https://habitrpg.com > Options > Settings).");
        showedFacebookMessage = true;
      }
      $scope.useUUID = !$scope.useUUID;
    };

    $scope.logout = function() {
      localStorage.clear();
      window.location.href = '/logout';
    };

    runAuth = function(id, token) {
      User.authenticate(id, token, function(err) {
        $window.location.href = '/';
        //$rootScope.modals.login = false;
      });
    };

    $scope.register = function() {
      /*TODO highlight invalid inputs
       we have this as a workaround for https://github.com/HabitRPG/habitrpg-mobile/issues/64
       */
      if ($scope.registrationForm.$invalid) {
        return;
      }
      $http.post(API_URL + "/api/v1/register", $scope.registerVals).success(function(data, status, headers, config) {
        runAuth(data.id, data.apiToken);
      }).error(function(data, status, headers, config) {
          if (status === 0) {
            $window.alert("Server not currently reachable, try again later");
          } else if (!!data && !!data.err) {
            $window.alert(data.err);
          } else {
            $window.alert("ERROR: " + status);
          }
        });
    };

    function errorAlert(data, status, headers, config) {
      if (status === 0) {
        $window.alert("Server not currently reachable, try again later");
      } else if (!!data && !!data.err) {
        $window.alert(data.err);
      } else {
        $window.alert("ERROR: " + status);
      }
    }

    $scope.auth = function() {
      var data = {
        username: $scope.loginUsername,
        password: $scope.loginPassword
      };
      if ($scope.useUUID) {
        runAuth($scope.loginUsername, $scope.loginPassword);
      } else {
        $http.post(API_URL + "/api/v1/user/auth/local", data)
          .success(function(data, status, headers, config) {
            runAuth(data.id, data.token);
          }).error(errorAlert);
      }
    };

    $scope.playButtonClick = function(){
      if (User.authenticated()) {
        window.location.href = '/#/tasks';
      } else {
        $('#login-modal').modal('show');
      }
    }

    $scope.passwordReset = function(email){
      $http.post(API_URL + '/api/v1/user/reset-password', {email:email})
        .success(function(){
          alert('New password sent.');
        })
        .error(function(data){
          alert(data.err);
        });
    }
  }
]);
