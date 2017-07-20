'use strict';

(function(){
  angular
    .module('habitrpg')
    .factory('Alert', alertFactory);

  alertFactory.$inject = [
    '$window', '$modal'
  ];

  function alertFactory($window, $modal) {

    function authErrorAlert(data, status, headers, config) {
      if (status === 0) {
        $window.alert(window.env.t('noReachServer'));
      } else if (status === 400 && data.errors && _.isArray(data.errors)) { // bad requests
        data.errors.forEach(function (err) {
          $window.alert(err.message);
        });
      } else if (data.error === 'AccountSuspended') {
        $modal.open({ templateUrl: 'modals/account-suspended.html', controller : ['$scope', function($scope) {
            let jadeArgs = JSON.parse(data.message);
            $scope.managerEmail = jadeArgs["communityManagerEmail"];
            $scope.userId = jadeArgs["userId"];
            $scope.userName = jadeArgs["userName"];
          }]
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
