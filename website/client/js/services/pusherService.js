'use strict';

angular.module('habitrpg')
.factory('Pusher', ['$rootScope', 'STORAGE_SETTINGS_ID', 'Groups',
  function($rootScope, STORAGE_SETTINGS_ID, Groups) {
    var settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS_ID));
    var IS_PUSHER_ENABLED = window.env['PUSHER:ENABLED'] === 'true';

    var api = {
      pusher: undefined,
      socketId: undefined, // when defined the user is connected
    };

    // Setup chat channels once app is ready, only for parties for now
    var clearAppLoadedListener = $rootScope.$watch('appLoaded', function (after) {
      if (!after) return;
      clearAppLoadedListener(); // clean the event listerner

      if (!IS_PUSHER_ENABLED) return;

      var user = $rootScope.user;

      // Connect the user to Pusher and to the party's chat channel
      var partyId = user && $rootScope.user.party && $rootScope.user.party._id;
      if (!partyId) return;

      api.pusher = new Pusher(window.env['PUSHER:KEY'], {
        encrypted: true,
        authEndpoint: '/api/v3/user/auth/pusher',
        auth: {
          headers: {
            'x-api-user': settings && settings.auth && settings.auth.apiId,
            'x-api-key': settings && settings.auth && settings.auth.apiToken,
          },
        },
      });

      api.pusher.connection.bind('connected', function () {
        api.socketId = api.pusher.connection.socket_id;
      });

      var partyChannelName = 'presence-group-' + partyId;
      var partyChannel = api.pusher.subscribe(partyChannelName);

      partyChannel.bind('new-chat', function (data) {
        if (Groups.data.party) {
          
        } else {
          Groups.party().then(function () {
            
          });
        }
      });

      // When the user is booted from the party, they get disconnected from Pusher
      partyChannel.bind('user-removed', function (data) {
        if (data.userId === user._id) {
          api.pusher.unsubscribe(partyChannelName);
        }
      });

      // Same when the user leaves the party
      partyChannel.bind('user-left', function (data) {
        if (data.userId === user._id) {
          api.pusher.unsubscribe(partyChannelName);
        }
      });

      partyChannel.bind('new-chat', function (data) {
        if (Groups.data.party) {
          Groups.data.party.chat.unshift(data);
        } else {
          Groups.party().then(function () {
            Groups.data.party.chat.unshift(data);
          });
        }
      });
    });

    return api;
  }]);
