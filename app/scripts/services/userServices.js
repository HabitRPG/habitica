'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('userServices', []).
    factory('User', function ($http, $location) {
        var STORAGE_ID = 'habitrpg-user',
            HABIT_MOBILE_SETTINGS = 'habit-mobile-settings',
            authenticated = false,
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
            URL = 'http://127.0.0.1:3000/api/v2',
            schema = {
                stats: { gp: 0, exp: 0, lvl: 1, hp: 50 },
                party: { current: null, invitation: null },
                items: { weapon: 0, armor: 0, head: 0, shield: 0, pets: [], eggs: []},
                preferences: { gender: 'm', skin: 'white', hair: 'blond', armorSet: 'v1' },
                auth: { timestamps: {savedAt: +new Date} },
                tasks: [], // note task-types are differentiated / filtered by type {habit, daily, todo, reward}
                lastCron: 'new',
                balance: 1,
                flags: {}
            },
            user = {}; // this is stored as a reference accessible to all controllers, that way updates propagate

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

            $http.post(URL, sent)
                .success(function (data, status, heacreatingders, config) {
                    data.tasks = _.toArray(data.tasks);
                    //make sure there are no pending actions to sync. If there are any it is not safe to apply model from server as we may overwrite user data.
                    if (!queue.length) {
                        //we can't do user=data as it will not update user references in all other angular controllers.
                        _.extend(user, data);
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
                    alert('Sync error: ' + data.err);
                    console.log(data);

                });


        };
        var save = function () {
            localStorage.setItem(STORAGE_ID, JSON.stringify(user));
            localStorage.setItem(HABIT_MOBILE_SETTINGS, JSON.stringify(settings));
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

            authenticate: function (apiId, apiToken, cb) {
                if (!!apiId && !!apiToken) {
                    $http.defaults.headers.common = {'Content-Type': "application/json;charset=utf-8"};
                    $http.defaults.headers.common['x-api-user'] = apiId;
                    $http.defaults.headers.common['x-api-key'] = apiToken;
                    authenticated = true;
                    settings.auth.apiId = apiId;
                    settings.auth.apiToken = apiToken;
                    settings.online = true;
                    this.log({}, cb);
                } else {
                    alert('Please enter your ID and Token in settings.')
                }
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
            settings: settings
        };


        //load settings if we have them
        if (localStorage.getItem(HABIT_MOBILE_SETTINGS)) {
            //use extend here to make sure we keep object reference in other angular controllers
            _.extend(settings, JSON.parse(localStorage.getItem(HABIT_MOBILE_SETTINGS)));

            //if settings were saved while fetch was in process reset the flag.
            settings.fetching = false;
            //create and load if not
        } else {
            localStorage.setItem(HABIT_MOBILE_SETTINGS, JSON.stringify(defaultSettings));
            _.extend(settings, defaultSettings);
        }

        //If user does not have ApiID that forward him to settings.
        if (!settings.auth.apiId || !settings.auth.apiToken) {
            $location.path("/login");
        } else {
            userServices.authenticate(settings.auth.apiId, settings.auth.apiToken)
        }


        //first we populate user with schema
        _.extend(user, schema);

        //than we try to load localStorage
        if (localStorage.getItem(STORAGE_ID)) {
            _.extend(user, JSON.parse(localStorage.getItem(STORAGE_ID)));
        }

        return userServices;

    });
