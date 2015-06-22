"use strict";

/*
 The authentication controller (login & facebook)
 */

angular.module('habitrpg')
  .controller("AuthCtrl", ['$scope', '$rootScope', 'User', '$http', '$location', '$window','ApiUrl', '$modal', 'Analytics',
    function($scope, $rootScope, User, $http, $location, $window, ApiUrl, $modal, Analytics) {

      $scope.logout = function() {
        localStorage.clear();
        window.location.href = '/logout';
      };

      var runAuth = function(id, token) {
        User.authenticate(id, token, function(err) {
          if(!err) $scope.registrationInProgress = false;
          $window.location.href = ('/' + window.location.hash);
        });
      };

      function errorAlert(data, status, headers, config) {
        $scope.registrationInProgress = false;
        if (status === 0) {
          $window.alert(window.env.t('noReachServer'));
        } else if (!!data && !!data.err) {
          $window.alert(data.err);
        } else {
          $window.alert(window.env.t('errorUpCase') + ' ' + status);
        }
      };

      $scope.registrationInProgress = false;

      $scope.register = function() {
        /*TODO highlight invalid inputs
         we have this as a workaround for https://github.com/HabitRPG/habitrpg-mobile/issues/64
         */
        var scope = angular.element(document.getElementById('registrationForm')).scope();
        if (scope.registrationForm.$invalid) return;

        $scope.registrationInProgress = true;

        var url = ApiUrl.get() + "/api/v2/register";
        if($rootScope.selectedLanguage) url = url + '?lang=' + $rootScope.selectedLanguage.code;
        $http.post(url, scope.registerVals).success(function(data, status, headers, config) {
          runAuth(data.id, data.apiToken);
          if (status == 200) {
            Analytics.register();
            if (data.auth.facebook) {
              Analytics.updateUser({'email':data.auth.facebook._json.email,'language':data.preferences.language});
              Analytics.track({'hitType':'event','eventCategory':'acquisition','eventAction':'register','authType':'facebook'});
            } else {
              Analytics.updateUser({'email':data.auth.local.email,'language':data.preferences.language});
              Analytics.track({'hitType':'event','eventCategory':'acquisition','eventAction':'register','authType':'email'});
            }
          }
        }).error(errorAlert);
      };

      $scope.auth = function() {
        var data = {
          username: $scope.loginUsername || $('#login-tab input[name="username"]').val(),
          password: $scope.loginPassword || $('#login-tab input[name="password"]').val()
        };
        $http.post(ApiUrl.get() + "/api/v2/user/auth/local", data)
          .success(function(data, status, headers, config) {
            runAuth(data.id, data.token);
            if (status == 200) {
              Analytics.login();
              Analytics.updateUser();
              Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'login'});
            }
          }).error(errorAlert);
      };

      $scope.playButtonClick = function(){
        Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Play'})
        if (User.authenticated()) {
          window.location.href = ('/' + window.location.hash);
        } else {
          $modal.open({
            templateUrl: 'modals/login.html'
            // Using controller: 'AuthCtrl' it causes problems
          });
        }
      };

      $scope.passwordReset = function(email){
        if(email == null || email.length == 0) {
          alert(window.env.t('invalidEmail'));
        } else {
          $http.post(ApiUrl.get() + '/api/v2/user/reset-password', {email:email})
            .success(function(){
              alert(window.env.t('newPassSent'));
            })
            .error(function(data){
                alert(data.err);
            });
          }
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

      // ------ Social ----------

      hello.init({
        facebook : window.env.FACEBOOK_KEY
      });

      $scope.socialLogin = function(network){
        hello(network).login({scope:'email'}).then(function(auth){
          $http.post(ApiUrl.get() + "/api/v2/user/auth/social", auth)
            .success(function(data, status, headers, config) {
              if (status == 200) {
                Analytics.login();
                Analytics.updateUser();
                Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'login'});
              }
              runAuth(data.id, data.token);
            }).error(errorAlert);
        }, function( e ){
          alert("Signin error: " + e.error.message );
        });
      }
    }
]);
