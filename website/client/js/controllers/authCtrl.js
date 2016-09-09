"use strict";

/*
 The authentication controller (login & facebook)
 */

angular.module('habitrpg')
  .controller("AuthCtrl", ['$scope', '$rootScope', 'User', '$http', '$location', '$window','ApiUrl', '$modal', 'Analytics',
    function($scope, $rootScope, User, $http, $location, $window, ApiUrl, $modal, Analytics) {
      $scope.Analytics = Analytics;

      $scope.logout = function() {
        localStorage.clear();
        $window.location.href = '/logout';
      };

      var runAuth = function(id, token) {
        User.authenticate(id, token, function(err) {
          if(!err) $scope.registrationInProgress = false;
          Analytics.login();
          Analytics.updateUser();
          $window.location.href = ('/' + window.location.hash);
        });
      };

      function errorAlert(data, status, headers, config) {
        $scope.registrationInProgress = false;
        if (status === 0) {
          $window.alert(window.env.t('noReachServer'));
        } else if (status === 400 && data.errors && _.isArray(data.errors)) { // bad requests
          data.errors.forEach(function (err) {
            $window.alert(err.message);
          });
        } else if (!!data && !!data.error) {
          $window.alert(data.message);
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

        var url = ApiUrl.get() + "/api/v3/user/auth/local/register";
        if (location.search && location.search.indexOf('Invite=') !== -1) { // matches groupInvite and partyInvite
          url += location.search;
        }

        if($rootScope.selectedLanguage) {
          var toAppend = url.indexOf('?') !== -1 ? '&' : '?';
          url = url + toAppend + 'lang=' + $rootScope.selectedLanguage.code;
        }

        $http.post(url, scope.registerVals).success(function(res, status, headers, config) {
          runAuth(res.data._id, res.data.apiToken);
          Analytics.register();
        }).error(errorAlert);
      };

      $scope.auth = function() {
        var data = {
          username: $scope.loginUsername || $('#loginForm input[name="username"]').val(),
          password: $scope.loginPassword || $('#loginForm input[name="password"]').val()
        };
        //@TODO: Move all the $http methods to a service
        $http.post(ApiUrl.get() + "/api/v3/user/auth/local/login", data)
          .success(function(res, status, headers, config) {
            runAuth(res.data.id, res.data.apiToken);
          }).error(errorAlert);
      };

      $scope.playButtonClick = function() {
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
          $http.post(ApiUrl.get() + '/api/v3/user/reset-password', {email:email})
            .success(function(){
              alert(window.env.t('newPassSent'));
            })
            .error(function(data){
                alert(data.err);
            });
          }
      };

      // ------ Social ----------

      hello.init({
        facebook : window.env.FACEBOOK_KEY
      });

      $scope.socialLogin = function(network){
        hello(network).login({scope:'email'}).then(function(auth){
          $http.post(ApiUrl.get() + "/api/v3/user/auth/social", auth)
            .success(function(res, status, headers, config) {
              runAuth(res.data.id, res.data.apiToken);
            }).error(errorAlert);
        }, function( e ){
          alert("Signin error: " + e.message );
        });
      };

      $scope.clearLocalStorage = function () {
        $scope.messageModal = {
          title: window.env.t('localStorageClearing'),
          body: window.env.t('localStorageClearingExplanation'),
          noFooter: true,
        };

        $modal.open({
          templateUrl: 'modals/message-modal.html',
          scope: $scope
        });

        var threeSecondsForUsersToReadClearLocalStorageMessage = 3000;

        setTimeout($scope.logout, threeSecondsForUsersToReadClearLocalStorageMessage);
      };
    }
]);
