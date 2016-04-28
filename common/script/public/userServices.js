'use strict';

angular.module('habitrpg')
  .service('ApiUrl', ['API_URL', function(currentApiUrl){
    this.setApiUrl = function(newUrl){
      currentApiUrl = newUrl;
    };

    this.get = function(){
      return currentApiUrl;
    };
  }])

/**
 * Services that persists and retrieves user from localStorage.
 */
  .factory('User', ['$rootScope', '$http', '$location', '$window', 'STORAGE_USER_ID', 'STORAGE_SETTINGS_ID', 'MOBILE_APP', 'Notification', 'ApiUrl',
    function($rootScope, $http, $location, $window, STORAGE_USER_ID, STORAGE_SETTINGS_ID, MOBILE_APP, Notification, ApiUrl) {
      var authenticated = false;
      var defaultSettings = {
        auth: { apiId: '', apiToken: ''},
        sync: {
          queue: [], //here OT will be queued up, this is NOT call-back queue!
          sent: [] //here will be OT which have been sent, but we have not got reply from server yet.
        },
        fetching: false,  // whether fetch() was called or no. this is to avoid race conditions
        online: false
      };
      var settings = {}; //habit mobile settings (like auth etc.) to be stored here
      var user = {}; // this is stored as a reference accessible to all controllers, that way updates propagate

      var userNotifications = {
        // "party.order" : env.t("updatedParty"),
        // "party.orderAscending" : env.t("updatedParty")
        // party.order notifications are not currently needed because the party avatars are resorted immediately now
      }; // this is a list of notifications to send to the user when changes are made, along with the message.

      //first we populate user with schema
      user.apiToken = user._id = ''; // we use id / apitoken to determine if registered

      //than we try to load localStorage
      if (localStorage.getItem(STORAGE_USER_ID)) {
        _.extend(user, JSON.parse(localStorage.getItem(STORAGE_USER_ID)));
      }
      user._wrapped = false;

      var syncQueue = function (cb) {
        if (!authenticated) {
          $window.alert("Not authenticated, can't sync, go to settings first.");
          return;
        }

        var queue = settings.sync.queue;
        var sent = settings.sync.sent;
        if (queue.length === 0) {
          // Sync: Queue is empty
          return;
        }
        if (settings.fetching) {
          // Sync: Already fetching
          return;
        }
        if (settings.online!==true) {
          // Sync: Not online
          return;
        }

        settings.fetching = true;
        // move all actions from queue array to sent array
        _.times(queue.length, function () {
          sent.push(queue.shift());
        });

        // Save the current filters
        var current_filters = user.filters;

        $http.post(ApiUrl.get() + '/api/v2/user/batch-update', sent, {params: {data:+new Date, _v:user._v, siteVersion: $window.env && $window.env.siteVersion}})
          .success(function (data, status, heacreatingders, config) {
            //make sure there are no pending actions to sync. If there are any it is not safe to apply model from server as we may overwrite user data.
            if (!queue.length) {
              //we can't do user=data as it will not update user references in all other angular controllers.

              // the user has been modified from another application, sync up
              if(data && data.wasModified) {
                delete data.wasModified;
                $rootScope.$emit('userUpdated', user);
              }

              // Update user
              _.extend(user, data);
              // Preserve filter selections between syncs
              _.extend(user.filters,current_filters);
              if (!user._wrapped){

                // This wraps user with `ops`, which are functions shared both on client and mobile. When performed on client,
                // they update the user in the browser and then send the request to the server, where the same operation is
                // replicated. We need to wrap each op to provide a callback to send that operation
                $window.habitrpgShared.wrap(user);
                _.each(user.ops, function(op,k){
                  user.ops[k] = function(req,cb){
                    if (cb) return op(req,cb);
                    op(req,function(err,response) {
                      for(var updatedItem in req.body) {
                        var itemUpdateResponse = userNotifications[updatedItem];
                        if(itemUpdateResponse) Notification.text(itemUpdateResponse);
                      }
                      if (err) {
                        var message = err.code ? err.message : err;
                        if (MOBILE_APP) Notification.push({type:'text',text:message});
                        else Notification.text(message);
                        // In the case of 200s, they're friendly alert messages like "Your pet has hatched!" - still send the op
                        if ((err.code && err.code >= 400) || !err.code) return; 
                      }
                      userServices.log({op:k, params: req.params, query:req.query, body:req.body});
                    });
                  }
                });
              }

              // Emit event when user is synced
              $rootScope.$emit('userSynced');
            }
            sent.length = 0;
            settings.fetching = false;
            save();
            if (cb) {
              cb(false)
            }

            syncQueue(); // call syncQueue to check if anyone pushed more actions to the queue while we were talking to server.
          })
          .error(function (data, status, headers, config) {
            // (Notifications handled in app.js)

            // If we're offline, queue up offline actions so we can send when we're back online
            if (status === 0) {
              //move sent actions back to queue
              _.times(sent.length, function () {
                  queue.push(sent.shift())
              });
              settings.fetching = false;
            // In the case of errors, discard the corrupt queue
            } else {
              // Clear the queue. Better if we can hunt down the problem op, but this is the easiest solution
              settings.sync.queue = settings.sync.sent = [];
              save();
            }
          });
      }


      var save = function () {
        localStorage.setItem(STORAGE_USER_ID, JSON.stringify(user));
        localStorage.setItem(STORAGE_SETTINGS_ID, JSON.stringify(settings));
      };
      var userServices = {
        user: user,
        set: function(updates) {
          user.ops.update({body:updates});
        },

        online: function (status) {
          if (status===true) {
            settings.online = true;
            syncQueue();
          } else {
            settings.online = false;
          };
        },

        authenticate: function (uuid, token, cb) {
          if (!!uuid && !!token) {
            var offset = moment().zone(); // eg, 240 - this will be converted on server as -(offset/60)
            $http.defaults.headers.common['x-api-user'] = uuid;
            $http.defaults.headers.common['x-api-key'] = token;
            $http.defaults.headers.common['x-user-timezoneOffset'] = offset;
            authenticated = true;
            settings.auth.apiId = uuid;
            settings.auth.apiToken = token;
            settings.online = true;
            if (user && user._v) user._v--; // shortcut to always fetch new updates on page reload
            userServices.log({}, function(){
              // If they don't have timezone, set it
              if (user.preferences.timezoneOffset !== offset)
                userServices.set({'preferences.timezoneOffset': offset});
              cb && cb();
            });
          } else {
            alert('Please enter your ID and Token in settings.')
          }
        },

        authenticated: function(){
          return this.settings.auth.apiId !== "";
        },

        getBalanceInGems: function() {
          var balance = user.balance || 0;
          return balance * 4;
        },

        log: function (action, cb) {
          //push by one buy one if an array passed in.
          if (_.isArray(action)) {
            action.forEach(function (a) {
              settings.sync.queue.push(a);
            });
          } else {
            settings.sync.queue.push(action);
          }

          save();
          syncQueue(cb);
        },

        sync: function(){
          user._v--;
          userServices.log({});
        },

        save: save,

        settings: settings
      };


      //load settings if we have them
      if (localStorage.getItem(STORAGE_SETTINGS_ID)) {
        //use extend here to make sure we keep object reference in other angular controllers
        _.extend(settings, JSON.parse(localStorage.getItem(STORAGE_SETTINGS_ID)));

        //if settings were saved while fetch was in process reset the flag.
        settings.fetching = false;
      //create and load if not
      } else {
        localStorage.setItem(STORAGE_SETTINGS_ID, JSON.stringify(defaultSettings));
        _.extend(settings, defaultSettings);
      }

      //If user does not have ApiID that forward him to settings.
      if (!settings.auth.apiId || !settings.auth.apiToken) {

        if (MOBILE_APP) {
          $location.path("/login");
        } else {
          //var search = $location.search(); // FIXME this should be working, but it's returning an empty object when at a root url /?_id=...
          var search = $location.search($window.location.search.substring(1)).$$search; // so we use this fugly hack instead
          if (search.err) return alert(search.err);
          if (search._id && search.apiToken) {
            userServices.authenticate(search._id, search.apiToken, function(){
              $window.location.href='/';
            });
          } else {
            var isStaticOrSocial = $window.location.pathname.match(/^\/(static|social)/);
            if (!isStaticOrSocial){
              localStorage.clear();
              $window.location.href = '/logout';
            }
          }
        }

      } else {
        userServices.authenticate(settings.auth.apiId, settings.auth.apiToken)
      }

      return userServices;
    }
]);
