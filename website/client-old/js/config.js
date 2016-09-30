'use strict';

angular.module('habitrpg')
.config(['$httpProvider', function($httpProvider){
  $httpProvider.interceptors.push(['$q', '$rootScope', function($q, $rootScope){
    var resyncNumber = 0;
    var lastResync = 0;

    // Verify that the user was not updated from another browser/app/client
    // If it was, sync
    function verifyUserUpdated (response) {
      var isApiCall = response.config.url.indexOf('api/v3') !== -1;
      var isUserAvailable = $rootScope.appLoaded === true;
      var hasUserV = response.data && response.data.userV;
      var isNotSync = response.config.url.indexOf('/api/v3/user') !== 0 || response.config.method !== 'GET';
      var isNotMarkChatSeen = response.config.url.indexOf('/chat/seen') === -1; // exclude chat seen requests because with real time chat they would be too many

      if (isApiCall && isUserAvailable && hasUserV) {
        var oldUserV = $rootScope.User.user._v;
        $rootScope.User.user._v = response.data.userV;

        // Something has changed on the user object that was not tracked here, sync the user
        if (isNotMarkChatSeen && isNotSync && ($rootScope.User.user._v - oldUserV) > 1) {
          $rootScope.User.sync();
        }
      }
    }

    function verifyNewNotifications (response) {
      // Ignore CRON notifications for manual syncs
      var isUserLoaded = $rootScope.appLoaded === true;

      if (response && response.data && response.data.notifications && response.data.notifications.length > 0) {
        $rootScope.userNotifications = response.data.notifications.filter(function (notification) {
          if (isUserLoaded && notification.type === 'CRON') {
            // If the user is already loaded, do not show the notification, syncing will show it
            // (the user will be synced automatically)
            $rootScope.User.readNotification(notification.id);
            return false;
          }

          return true;
        });
      }
    }

    return {
      request: function (config) {
        var url = config.url;

        if (url.indexOf('api/v3') !== -1) {
          if ($rootScope.User && $rootScope.User.user) {
            if (url.indexOf('?') !== -1) {
              config.url += '&userV=' + $rootScope.User.user._v;
            } else {
              config.url += '?userV=' + $rootScope.User.user._v;
            }
          }
        }

        return config;
      },
      response: function(response) {
        verifyUserUpdated(response);
        verifyNewNotifications(response);
        return response;
      },
      responseError: function(response) {
        var mobileApp = !!window.env.appVersion;

        // Offline
        if (response.status == 0 ||
          // don't know why we're getting 404 here, should be 0
          (response.status == 404 && _.isEmpty(response.data))) {

          if (!mobileApp)  // skip mobile, queue actions
            $rootScope.$broadcast('responseText', window.env.t('serverUnreach'));

        // Needs refresh
        } else if (response.needRefresh) {
          if (!mobileApp) // skip mobile for now
            $rootScope.$broadcast('responseError', "The site has been updated and the page needs to refresh. The last action has not been recorded, please refresh and try again.");

        } else if (response.data && response.data.code && response.data.code === 'ACCOUNT_SUSPENDED') {
          confirm(response.data.err);
          localStorage.clear();
          window.location.href = mobileApp ? '/app/login' : '/logout'; //location.reload()

        // 400 range
        } else if (response.status < 400) {
          // never triggered because we're in responseError
          $rootScope.$broadcast('responseText', response.data && response.data.message);
        } else if (response.status < 500) {
          if (response.status === 400 && response.data && response.data.errors && _.isArray(response.data.errors)) { // bad requests with more info
            response.data.errors.forEach(function (err) {
              $rootScope.$broadcast('responseError', err.message);
            });
          } else {
            $rootScope.$broadcast('responseError', response.data && response.data.message);
          }

          if ($rootScope.User && $rootScope.User.sync) {
            if (resyncNumber < 100 && (Date.now() - lastResync) > 500) { // avoid thousands of requests when user is not found
              $rootScope.User.sync();
              resyncNumber++;
              lastResync = Date.now();
            }
          }

          // Need to reject the prompse so the error is handled correctly
          if (response.status === 401) {
            return $q.reject(response);
          }
        // Error
        } else {
          var error = window.env.t('requestError') + '<br><br>"' +
          window.env.t('error') + ' ' + (response.data.message || response.data.error || response.data || 'something went wrong') +
          '" <br><br>' + window.env.t('seeConsole');
          if (mobileApp) error = 'Error contacting the server. Please try again in a few minutes.';
          $rootScope.$broadcast('responseError500', error);
          console.error(response);
        }

        return $q.reject(response);
      }
    };
  }]);
}]);
