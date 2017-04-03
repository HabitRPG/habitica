'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Alert', alertFactory);

  alertFactory.$inject = [
    '$window'
  ];

  function alertFactory($window) {

    function authErrorAlert(data, status, headers, config) {
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

    return {
      authErrorAlert: authErrorAlert,
    }
  }
}());
