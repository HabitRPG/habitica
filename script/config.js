'use strict';
angular.module('habitrpg').config(['$httpProvider', function($httpProvider){
  $httpProvider.interceptors.push(['$q', '$rootScope', function($q, $rootScope){
    return {
      response: function(response) {
        return response;
      },
      responseError: function(response) {
        // Offline
        if (response.status == 0 ||
          // don't know why we're getting 404 here, should be 0
          (response.status == 404 && _.isEmpty(response.data))) {
          $rootScope.$broadcast('responseText', window.env.t('serverUnreach'));

          // Needs refresh
        } else if (response.needRefresh) {
          $rootScope.$broadcast('responseError', "The site has been updated and the page needs to refresh. The last action has not been recorded, please refresh and try again.");

        } else if (response.data.code && response.data.code === 'ACCOUNT_SUSPENDED') {
          confirm(response.data.err);
          localStorage.clear();
          window.location.href = '/logout';

          // 400 range?
        } else if (response.status < 500) {
          $rootScope.$broadcast('responseText', response.data.err || response.data);
          // Need to reject the prompse so the error is handled correctly
          if (response.status === 401) {
            return $q.reject(response);
          }

          // Error
        } else {
          var error = '<strong>Please reload</strong>, ' +
            '"'+window.env.t('error')+' '+(response.data.err || response.data || 'something went wrong')+'" ' +
            window.env.t('seeConsole');
          $rootScope.$broadcast('responseError', error);
          console.error(response);
        }

        return $q.reject(response);
      }
    };
  }]);
}]);