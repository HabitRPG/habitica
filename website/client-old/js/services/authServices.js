'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Auth', authFactory);

  authFactory.$inject = [
    '$window',
    'User',
    'Analytics'
  ];

  function authFactory($window, User, Analytics) {

    var runAuth = function(id, token) {
      User.authenticate(id, token, function(err) {
        Analytics.login();
        Analytics.updateUser();
        $window.location.href = ('/' + window.location.hash);
      });
    };

    return {
      runAuth: runAuth,
    }
  }
}());
