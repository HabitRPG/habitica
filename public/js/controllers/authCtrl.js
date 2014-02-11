"use strict";

/*
 The authentication controller (login & facebook)
 */

angular.module('authCtrl', [])
  .controller("AuthCtrl", ['$scope', '$rootScope', 'User', '$http', '$location', '$window','API_URL', '$modal',
    function($scope, $rootScope, User, $http, $location, $window, API_URL, $modal) {
      var runAuth;
      var showedFacebookMessage;

      $scope.useUUID = false;
      $scope.toggleUUID = function() {
        if (showedFacebookMessage === false) {
          alert(window.env.t('untilNoFace'));
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
        });
      };

      function errorAlert(data, status, headers, config) {
        if (status === 0) {
          $window.alert(window.env.t('noReachServer'));
        } else if (!!data && !!data.err) {
          $window.alert(data.err);
        } else {
          $window.alert(window.env.t('errorUpCase') + ' ' + status);
        }
      };

      $scope.register = function() {
        /*TODO highlight invalid inputs
         we have this as a workaround for https://github.com/HabitRPG/habitrpg-mobile/issues/64
         */
        if ($scope.registrationForm.$invalid) {
          return;
        }
        $http.post(API_URL + "/api/v2/register", $scope.registerVals).success(function(data, status, headers, config) {
          runAuth(data.id, data.apiToken);
        }).error(errorAlert);
      };

      $scope.auth = function() {
        var data = {
          username: $scope.loginUsername || $('#login-tab input[name="username"]').val(),
          password: $scope.loginPassword || $('#login-tab input[name="password"]').val()
        };
        if ($scope.useUUID) {
          runAuth($scope.loginUsername, $scope.loginPassword);
        } else {
          $http.post(API_URL + "/api/v2/user/auth/local", data)
            .success(function(data, status, headers, config) {
              runAuth(data.id, data.token);
            }).error(errorAlert);
        }
      };

      $scope.playButtonClick = function(){
        window.ga && ga('send', 'event', 'button', 'click', 'Play');
        if (User.authenticated()) {
          window.location.href = '/#/tasks';
        } else {
          $modal.open({
            templateUrl: 'modals/login.html'
            // Using controller: 'AuthCtrl' it causes problems
          });
        }
      }

      $scope.passwordReset = function(email){
        $http.post(API_URL + '/api/v2/user/reset-password', {email:email})
          .success(function(){
            alert(window.env.t('newPassSent'));
          })
          .error(function(data){
            alert(data.err);
          });
      }
    }
]);
