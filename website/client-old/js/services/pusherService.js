'use strict';

angular.module('habitrpg')
.factory('Pusher', ['$rootScope', 'STORAGE_SETTINGS_ID', 'Groups', 'Shared', '$state', 'Chat', 'Notification',
  function($rootScope, STORAGE_SETTINGS_ID, Groups, Shared, $state, Chat, Notification) {
    var settings = JSON.parse(localStorage.getItem(STORAGE_SETTINGS_ID));
    var IS_PUSHER_ENABLED = window.env['PUSHER:ENABLED'] === 'true';

    var partyId;
    var onActivityEvent;

    var api = {
      pusher: undefined,
      socketId: undefined, // when defined the user is connected
    };
    var tabIdKey = 'habitica-active-tab-v1';
    var tabId = Shared.uuid();

    var localStorageDateInterval;

    function onDisconnect () {
      localStorage.removeItem(tabIdKey);
      localStorage.removeItem(tabIdKey + '-time');
      if (localStorageDateInterval) clearInterval(localStorageDateInterval);
    }

    function connectToPusher (partyId, reconnecting) {
      console.log('Connecting to Pusher.');

      // Limit 1 tab connected per user
      localStorage.setItem(tabIdKey, tabId);
      localStorage.setItem(tabIdKey + '-time', Date.now());

      // Every 10 seconds log the current time to localstorage, so if for some reason
      // localStorage.tabIdKey get stuck, the next time the user reconnect and
      // the last logged date has been long ago
      localStorageDateInterval = setInterval(function () {
        localStorage.setItem(tabIdKey + '-time', Date.now());
      }, 10000);

      window.onbeforeunload = onDisconnect;

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

      // Disconnect after 30m of inactivity
      var DISCONNECTION_AFTER = 1800000; // 30m
      var disconnectionTimeout;

      var awaitIdle = function () {
        if(disconnectionTimeout) clearTimeout(disconnectionTimeout);
        disconnectionTimeout = setTimeout(function () {
          $(document).off('mousemove keydown mousedown touchstart', awaitIdle);
          disconnectPusher();
        }, DISCONNECTION_AFTER);
      };

      awaitIdle();
      $(document).on('mousemove keydown mousedown touchstart', awaitIdle);

      api.pusher.connection.bind('error', function (err) {
        console.error(err);
        // TODO if( err.data.code === 4004 ) detected connection limit
      });

      api.pusher.connection.bind('connected', function () {
        $rootScope.pusherSocketId = api.socketId = api.pusher.connection.socket_id;
      });

      var partyChannelName = 'presence-group-' + partyId;
      var partyChannel = api.pusher.subscribe(partyChannelName);

      // When an error occurs while joining the channel
      partyChannel.bind('pusher:subscription_error', function(status) {
        console.error('Impossible to join the Pusher channel for your party, status: ', status);
      });

      // When the user correctly enters the party channel
      partyChannel.bind('pusher:subscription_succeeded', function(pusherMembers) {
        // Wait for the party to be loaded
        Groups.party(reconnecting).then(function (party) {
          // If we just reconnected after some inactivity, sync the party
          if (reconnecting === true) {
            _.assign($rootScope.party, party);
            $rootScope.loadingParty = false; // make sure the party is set as loaded
          }

          $rootScope.party.onlineUsers = pusherMembers.count;

          $rootScope.party.members.forEach(function (member) {
            if (pusherMembers.members[member._id]) {
              member.online = true;
            }
          });
        });

        // When a member enters the party channel
        partyChannel.bind('pusher:member_added', function(pusherMember) {
          $rootScope.$apply(function() {
            $rootScope.party.members.find(function (partyMember) {
              if (partyMember._id === pusherMember.id) {
                partyMember.online = true;
                return true;
              }
            });
            $rootScope.party.onlineUsers++;
          });
        });

        // When a member leaves the party channel
        partyChannel.bind('pusher:member_removed', function(pusherMember) {
          $rootScope.$apply(function() {
            $rootScope.party.onlineUsers--;
            $rootScope.party.members.find(function (partyMember) {
              if (partyMember._id === pusherMember.id) {
                partyMember.online = false;
                return true;
              }
            });
          });
        });
      });

      // When the user is booted from the party, they get disconnected from Pusher
      partyChannel.bind('user-removed', function (data) {
        if (data.userId === $rootScope.User.user._id) {
          api.pusher.unsubscribe(partyChannelName);
        }
      });

      // Same when the user leaves the party
      partyChannel.bind('user-left', function (data) {
        if (data.userId === $rootScope.User.user._id) {
          api.pusher.unsubscribe(partyChannelName);
        }
      });

      // When a new chat message is posted
      partyChannel.bind('new-chat', function (chatData) {
        Groups.party().then(function () { // wait for the party to be fully loaded
          $rootScope.loadingParty = false; // make sure the party is set as loaded

          // Update the party data
          Groups.data.party.chat.unshift(chatData);
          Groups.data.party.chat.splice(200);

          // If a system message comes in, sync the party as quest status may have changed
          if (chatData.uuid === 'system') {
            $rootScope.User.sync();
            Groups.party(true).then(function (syncedParty) {
              // Assign and not replace so that all the references get the modifications
              _.assign($rootScope.party, syncedParty);
            });
          }

          var docHasFocus = document.hasFocus();
          var isOnPartyPage = $state.is('options.social.party');

          // if we're on the party page or the message was sent by us, mark the chat as read but don't show notifications
          if ((isOnPartyPage && docHasFocus) || chatData.uuid === $rootScope.User.user._id) {
            Chat.markChatSeen($rootScope.party._id);
          } else { // show a notification
            $rootScope.User.user.newMessages[$rootScope.party._id] = {
              name: $rootScope.party.name,
              value: true,
            };

            if ('Notification' in window && window.Notification.permission === 'granted') {
              var notif = new window.Notification(env.t('newChatMessageTitle', {
                groupName: $rootScope.party.name,
              }), {
                body: (chatData.user || chatData.uuid) + ': ' + chatData.text,
                icon: '/assets/img/gryphon_192-20.png'
              });

              notif.addEventListener('click', function () {
                if (!isOnPartyPage) $state.go('options.social.party');
                if (!docHasFocus) Chat.markChatSeen($rootScope.party._id);
                notif.close();
              });
            } else {
              Notification.text(env.t('newChatMessagePlainNotification', {
                groupName: $rootScope.party.name,
                authorName: chatData.user || chatData.uuid,
              }), function() {
                if (!isOnPartyPage) $state.go('options.social.party');
                if (!docHasFocus) Chat.markChatSeen($rootScope.party._id);
              });
            }
          }
        });
      });
    };

    function disconnectPusher () {
      console.log('Disconnecting from Pusher for inactivity.');
      api.pusher.disconnect();
      window.onbeforeunload = null; // TODO use addEventListener
      onDisconnect();

      var awaitActivity = function() {
        $(document).off('mousemove keydown mousedown touchstart', awaitActivity);
        var lastSavedDate = localStorage.getItem(tabIdKey + '-time') || 0;

        if (!localStorage.getItem(tabIdKey) || localStorage.getItem(tabIdKey) === tabId || ((Date.now() - lastSavedDate) > 30000)) {
          connectToPusher(partyId, true);
        } else {
          console.log('Cannot connect 2 tabs to Pusher.');
        }
      };

      $(document).on('mousemove keydown mousedown touchstart', awaitActivity);
    };

    // Setup chat channels once app is ready, only for parties for now
    var clearAppLoadedListener = $rootScope.$watch('appLoaded', function (after) {
      if (!after) return;
      clearAppLoadedListener(); // clean the event listerner

      if (!IS_PUSHER_ENABLED) return;

      var user = $rootScope.user;

      // Connect the user to Pusher and to the party's chat channel
      partyId = user && $rootScope.user.party && $rootScope.user.party._id;
      if (!partyId) return;

      // See if another tab is already connected to Pusher (or if it got stuck: last saved date more than 30 sec ago)
      var lastSavedDate = localStorage.getItem(tabIdKey + '-time') || 0;

      if (!localStorage.getItem(tabIdKey) || ((Date.now() - lastSavedDate) > 30000)) {
        connectToPusher(partyId);
      } else {
        console.log('Cannot connect 2 tabs to Pusher.');
      }

      // when a tab is closed, connect the next one
      // wait between 100 and 500ms to avoid two tabs connecting at the same time
      window.addEventListener('storage', function(e) {
        if (e.key === tabIdKey && e.newValue === null) {
          setTimeout(function () {
            var lastSavedDate = localStorage.getItem(tabIdKey + '-time') || 0;
            if (!localStorage.getItem(tabIdKey) || ((Date.now() - lastSavedDate) > 30000)) {
              connectToPusher(partyId, true);
            } else {
              console.log('Cannot connect 2 tabs to Pusher.');
            }
          }, Math.floor(Math.random() * 501) + 100);
        }
      });
    });

    return api;
  }]);
