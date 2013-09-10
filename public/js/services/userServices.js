'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('userServices', []).
    factory('User', ['$http', '$location', 'API_URL', 'STORAGE_USER_ID', 'STORAGE_SETTINGS_ID', 'Members',
      function($http, $location, API_URL, STORAGE_USER_ID, STORAGE_SETTINGS_ID, Members) {
        var authenticated = false,
            defaultSettings = {
                auth: { apiId: '', apiToken: ''},
                sync: {
                    queue: [], //here OT will be queued up, this is NOT call-back queue!
                    sent: [] //here will be OT which have been sent, but we have not got reply from server yet.
                },
                fetching: false,  // whether fetch() was called or no. this is to avoid race conditions
                online: false
            },
            settings = {}, //habit mobile settings (like auth etc.) to be stored here
            user = {}; // this is stored as a reference accessible to all controllers, that way updates propagate

              //first we populate user with schema
            _.extend(user, window.habitrpgShared.helpers.newUser());
            user.apiToken = user._id = ''; // we use id / apitoken to determine if registered

              //than we try to load localStorage
            
            if (localStorage.getItem(STORAGE_USER_ID)) {
                _.extend(user, JSON.parse(localStorage.getItem(STORAGE_USER_ID)));
            }

        var syncQueue = function (cb) {
            if (!authenticated) {
                alert("Not authenticated, can't sync, go to settings first.");
                return;
            }

            var queue = settings.sync.queue;
            var sent = settings.sync.sent;
            if (queue.length === 0) {
                console.log('Sync: Queue is empty');
                return;
            }
            if (settings.fetching) {
                console.log('Sync: Already fetching');
                return;
            }
            if (settings.online!==true) {
                console.log('Sync: Not online');
                return;
            }

            settings.fetching = true;
//                move all actions from queue array to sent array
            _.times(queue.length, function () {
                sent.push(queue.shift());
            });

            $http.post(API_URL + '/api/v1/user/batch-update', sent, {params: {data:+new Date, _v:user._v}})
                .success(function (data, status, heacreatingders, config) {
                    data.tasks = _.toArray(data.tasks);
                    //make sure there are no pending actions to sync. If there are any it is not safe to apply model from server as we may overwrite user data.
                    if (!queue.length) {
                        //we can't do user=data as it will not update user references in all other angular controllers.

                        // the user has been modified from another application, sync up
                        if(data.wasModified) {
                          delete data.wasModified;
                          _.extend(user, data);
                        }
                        user._v = data._v;
                        Members.populate(user);

                        // FIXME handle this somewhere else, we don't need to check every single time
                        var offset = moment().zone(); // eg, 240 - this will be converted on server as -(offset/60)
                        if (!user.preferences.timezoneOffset || user.preferences.timezoneOffset !== offset) {
                          userServices.log({op:'set', data: {'preferences.timezoneOffset': offset}});
                        }
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
                    //move sent actions back to queue
                    _.times(sent.length, function () {
                        queue.push(sent.shift())
                    });
                    settings.fetching = false;
                    //Notification.push({type:'text', text:"We're offline"})

                });

                }


        var save = function () {
            localStorage.setItem(STORAGE_USER_ID, JSON.stringify(user));
            localStorage.setItem(STORAGE_SETTINGS_ID, JSON.stringify(settings));
        };
        var userServices = {
            user: user,
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
                    $http.defaults.headers.common['x-api-user'] = uuid;
                    $http.defaults.headers.common['x-api-key'] = token;
                    authenticated = true;
                    settings.auth.apiId = uuid;
                    settings.auth.apiToken = token;
                    settings.online = true;
                    if (user && user._v) user._v--; // shortcut to always fetch new updates on page reload
                    this.log({}, cb);
                } else {
                    alert('Please enter your ID and Token in settings.')
                }
            },

            authenticated: function(){
              return this.settings.auth.apiId !== "";
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

            /*
             Very simple path-set. `set('preferences.gender','m')` for example. We'll deprecate this once we have a complete API
             */
            set: function(k, v) {
              var self = userServices;
              var log = { op: 'set', data: {} };
              window.habitrpgShared.helpers.dotSet(k, v, userServices.user);
              log.data[k] = v;
              userServices.log(log);
            },

            setMultiple: function(obj){
              var self = this;
              var log = { op: 'set', data: {} };
              _.each(obj, function(v,k){
                window.habitrpgShared.helpers.dotSet(k, v, userServices.user);
                log.data[k] = v;
              })
              userServices.log(log);
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
          //var search = $location.search(); // FIXME this should be working, but it's returning an empty object when at a root url /?_id=...
          var search = $location.search(window.location.search.substring(1)).$$search; // so we use this fugly hack instead
          if (search.err) return alert(search.err);
          if (search._id && search.apiToken) {
            userServices.authenticate(search._id, search.apiToken, function(){
              window.location.href='/';
            });
          } else {
            if (window.location.pathname.indexOf('/static') !== 0){
              localStorage.clear();
              window.location.href = '/logout';
            }
          }
        } else {
            userServices.authenticate(settings.auth.apiId, settings.auth.apiToken)
        }

        return userServices;

    }
]);
