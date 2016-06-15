'use strict';

angular.module('habitrpg')
.factory('Pusher', ['$rootScope', 'STORAGE_SETTINGS_ID',
  function($rootScope, STORAGE_SETTINGS_ID) {
    var settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS_ID));
    var IS_PUSHER_ENABLED = window.env.PUSHER.ENABLED === 'true';

    var api = {
      pusher: undefined,
      socketId: undefined,
    };

    if (IS_PUSHER_ENABLED) {
      api.pusher = new Pusher(window.env.PUSHER.KEY, {
        encrypted: true,
        authEndpoint: '/api/v3/user/auth/pusher',
        auth: {
          headers: {
            'x-api-user': settings && settings.auth && settings.auth.apiId,
            'x-api-key': settings && settings.auth && settings.auth.apiToken,
          },
        },
      });

      api.pusher.connection.bind('connected', function() {
        api.socketId = api.pusher.connection.socket_id;
      });
    }

    // Setup chat listeners once app is ready
    var clearAppLoadedListener = $rootScope.$watch('appLoaded', function (after) {
      if (after === true) {
        // Subscribe user to chat notifications
        if (IS_PUSHER_ENABLED && $rootScope.user && $rootScope.user.party && $rootScope.user.party._id) {
          var partyChannel = api.pusher.subscribe('private-group-' + $rootScope.user.party._id);
          partyChannel.bind('new-chat', function (data) {
            alert('new chat message in your party: ' + data.text);
          });
        }

        // Clear listener
        clearAppLoadedListener();
      }
    });


    return api;
  }]);
