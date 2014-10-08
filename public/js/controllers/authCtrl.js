"use strict";

/*
 The authentication controller (login & facebook)
 */

angular.module('authCtrl', [])
  .controller("AuthCtrl", ['$scope', '$rootScope', 'User', '$http', '$location', '$window','ApiUrlService', '$modal',
    function($scope, $rootScope, User, $http, $location, $window, ApiUrlService, $modal) {
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
        var url = ApiUrlService.get() + "/api/v2/register";
        if($rootScope.selectedLanguage) url = url + '?lang=' + $rootScope.selectedLanguage.code;
        $http.post(url, $scope.registerVals).success(function(data, status, headers, config) {
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
          $http.post(ApiUrlService.get() + "/api/v2/user/auth/local", data)
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
      };

      $scope.passwordReset = function(email){
        $http.post(ApiUrlService.get() + '/api/v2/user/reset-password', {email:email})
          .success(function(){
            alert(window.env.t('newPassSent'));
          })
          .error(function(data){
            alert(data.err);
          });
      };

      $scope.expandMenu = function(menu) {
        $scope._expandedMenu = ($scope._expandedMenu == menu) ? null : menu;
      };

      function selectNotificationValue(mysteryValue, invitationValue, unallocatedValue, messageValue, noneValue) {
        var user = $scope.user;
        if (user.purchased && user.purchased.plan && user.purchased.plan.mysteryItems && user.purchased.plan.mysteryItems.length) {
          return mysteryValue;
        } else if ((user.invitations.party && user.invitations.party.id) || (user.invitations.guilds && user.invitations.guilds.length > 0)) {
          return invitationValue;
        } else if (user.flags.classSelected && !(user.preferences && user.preferences.disableClasses) && user.stats.points) {
          return unallocatedValue;
        } else if (!(_.isEmpty(user.newMessages))) {
          return messageValue;
        } else {
          return noneValue;
        }
      };

      $scope.iconClasses = function() {
        return selectNotificationValue(
            "glyphicon-gift",
            "glyphicon-user",
            "glyphicon-plus-sign",
            "glyphicon-comment",
            "glyphicon-comment inactive");
      };

      $scope.hasNoNotifications = function() {
        return selectNotificationValue(false, false, false, false, true);
      }
    }
]);
