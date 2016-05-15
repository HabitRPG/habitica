'use strict';

angular.module('habitrpg')
  .service('ApiUrl', ['API_URL', function(currentApiUrl) {
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
  .factory('User', ['$rootScope', '$http', '$location', '$window', 'STORAGE_USER_ID', 'STORAGE_SETTINGS_ID', 'Notification', 'ApiUrl', 'Tasks', 'Tags',
    function($rootScope, $http, $location, $window, STORAGE_USER_ID, STORAGE_SETTINGS_ID, Notification, ApiUrl, Tasks, Tags) {
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

      function sync() {
        return $http({
          method: "GET",
          url: '/api/v3/user/',
        })
        .then(function (response) {
          if (response.data.message) Notification.text(response.data.message);

          _.extend(user, response.data.data);

          if (!user._wrapped) {
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
                    Notification.text(message);
                    // In the case of 200s, they're friendly alert messages like "Your pet has hatched!" - still send the op
                    if ((err.code && err.code >= 400) || !err.code) return;
                  }
                  userServices.log({op:k, params: req.params, query:req.query, body:req.body});
                });
              }
            });
          }

          return Tasks.getUserTasks();
        })
        .then(function (response) {
          var tasks = response.data.data;
          user.habits = [];
          user.todos = [];
          user.dailys = [];
          user.rewards = [];
          tasks.forEach(function (element, index, array) {
            user[element.type + 's'].push(element)
          })

          save();
          $rootScope.$emit('userSynced');
        });
      }
      sync();

      var save = function () {
        localStorage.setItem(STORAGE_USER_ID, JSON.stringify(user));
        localStorage.setItem(STORAGE_SETTINGS_ID, JSON.stringify(settings));
      };

      function callOpsFunctionAndRequest (opName, endPoint, method, paramString, opData) {
        if (!opData) opData = {};

        try {
          $window.habitrpgShared.ops[opName](user, opData);
        } catch(err) {
          Notification.text(err.message);
          return;
        }

        var url = '/api/v3/user/' + endPoint;
        if (paramString) {
          url += '/' + paramString
        }

        var body = {};
        if (opData.body) body = opData.body;

        var queryString = '';
        if (opData.query) queryString = '?' + $.param(opData.query)

        $http({
          method: method,
          url: url + queryString,
          body: body,
        })
        .then(function (response) {
          if (response.data.message) Notification.text(response.data.message);
          save();
        })
      }

      function setUser(updates) {
        for (var key in updates) {
          _.set(user, key, updates[key]);
        }
      }

      var userServices = {
        user: user,

        //@TODO: WE need a new way to set the user from tests
        setUser: function (userInc) {
          user = userInc;
        },

        allocate: function (data) {
          callOpsFunctionAndRequest('allocate', 'allocate', "POST",'', data);
        },

        allocateNow: function () {
          callOpsFunctionAndRequest('allocateNow', 'allocate-now', "POST");
        },

        changeClass: function (data) {
          callOpsFunctionAndRequest('changeClass', 'change-class', "POST",'', data);
        },

        disableClasses: function () {
          callOpsFunctionAndRequest('disableClasses', 'disable-classes', "POST");
        },

        revive: function (data) {
          callOpsFunctionAndRequest('revive', 'revive', "POST");
        },

        addTask: function (data) {
          user.ops.addTask(data);
          save();
          Tasks.createUserTasks(data.body);
        },

        score: function (data) {
          $window.habitrpgShared.ops.scoreTask({user: user, task: data.params.task, direction: data.params.direction}, data.params);
          save();
          Tasks.scoreTask(data.params.task._id, data.params.direction).then(function (res) {
            var tmp = res.data.data._tmp || {}; // used to notify drops, critical hits and other bonuses

            var drop = tmp.drop;
            var crit = tmp.crit;
            var streakBonus = tmp.streakBonus;

            if (drop) user._tmp.drop = drop;
            if (crit) user._tmp.crit = crit;
            if (streakBonus) user._tmp.streakBonus = streakBonus;
          });
        },

        sortTask: function (data) {
          user.ops.sortTask(data);
          save();
          Tasks.moveTask(data.params.id, data.query.to);
        },

        updateTask: function (task, data) {
          $window.habitrpgShared.ops.updateTask(task, data);
          save();
          Tasks.updateTask(task._id, data.body);
        },

        deleteTask: function (data) {
          user.ops.deleteTask(data);
          save();
          Tasks.deleteTask(data.params.id);
        },

        clearCompleted: function () {
          user.ops.clearCompleted(user.todos);
          save();
          Tasks.clearCompletedTodos();
        },

        addTag: function(data) {
          user.ops.addTag(data);
          save();
          Tags.createTag(data.body);
        },

        updateTag: function(data) {
          user.ops.updateTag(data);
          save();
          Tags.updateTag(data.params.id, data.body);
        },

        deleteTag: function(data) {
          user.ops.deleteTag(data);
          save();
          Tags.deleteTag(data.params.id);
        },

        addTenGems: function () {
          $http({
            method: "POST",
            url: 'api/v3/debug/add-ten-gems',
          })
          .then(function (response) {
            Notification.text('+10 Gems!');
            sync();
          })
        },

        addHourglass: function () {
          $http({
            method: "POST",
            url: 'api/v3/debug/add-hourglass',
          })
          .then(function (response) {
            sync();
          })
        },

        setCron: function (numberOfDays) {
          var date = moment(user.lastCron).subtract(numberOfDays, 'days').toDate();

          $http({
            method: "POST",
            url: 'api/v3/debug/set-cron',
            data: {
              lastCron: date
            }
          })
          .then(function (response) {
            Notification.text('-' + numberOfDays + ' day(s), remember to refresh');
          });
        },

        makeAdmin: function () {
          $http({
            method: "POST",
            url: 'api/v3/debug/make-admin'
          })
          .then(function (response) {
            Notification.text('You are now an admin! Go to the Hall of Heroes to change your contributor level.');
            sync()
          });
        },

        clearNewMessages: function () {
          callOpsFunctionAndRequest('markPmsRead', 'mark-pms-read', "POST");
        },

        clearPMs: function () {
          callOpsFunctionAndRequest('clearPMs', 'messages', "DELETE");
        },

        deletePM: function (data) {
          callOpsFunctionAndRequest('deletePM', 'messages', "DELETE", data.params.id, data);
        },

        buy: function (data) {
          callOpsFunctionAndRequest('buy', 'buy', "POST", data.params.key, data);
        },

        buyQuest: function (data) {
          callOpsFunctionAndRequest('buyQuest', 'buy-quest', "POST", data.params.key, data);
        },

        purchase: function (data) {
          var type = data.params.type;
          var key = data.params.key;
          callOpsFunctionAndRequest('purchase', 'purchase', "POST", type + '/' + key, data);
        },

        buySpecialSpell: function (data) {
          $window.habitrpgShared.ops['buySpecialSpell'](user, data);
          var key = data.params.key;

          $http({
            method: "POST",
            url: '/api/v3/user/' + 'buy-special-spell/' + key,
          })
          .then(function (response) {
            Notification.text(response.data.message);
          })
        },

        buyMysterySet: function (data) {
          callOpsFunctionAndRequest('buyMysterySet', 'buy-mystery-set', "POST", data.params.key, data);
        },

        readCard: function (data) {
          callOpsFunctionAndRequest('readCard', 'read-card', "POST", data.params.cardType, data);
        },

        openMysteryItem: function (data) {
          callOpsFunctionAndRequest('openMysteryItem', 'open-mystery-item', "POST");
        },

        sell: function (data) {
          var type = data.params.type;
          var key = data.params.key;
          callOpsFunctionAndRequest('sell', 'sell', "POST", type + '/' + key, data);
        },

        hatch: function (data) {
          var egg = data.params.egg;
          var hatchingPotion = data.params.hatchingPotion;
          callOpsFunctionAndRequest('hatch', 'hatch', "POST", egg + '/' + hatchingPotion, data);
        },

        feed: function (data) {
          var pet = data.params.pet;
          var food = data.params.food;
          callOpsFunctionAndRequest('feed', 'feed', "POST", pet + '/' + food, data);
        },

        equip: function (data) {
          var type = data.params.type;
          var key = data.params.key;
          callOpsFunctionAndRequest('equip', 'equip', "POST", type + '/' + key, data);
        },

        hourglassPurchase: function (data) {
          var type = data.params.type;
          var key = data.params.key;
          callOpsFunctionAndRequest('purchaseHourglass', 'purchase-hourglass', "POST", type + '/' + key, data);
        },

        unlock: function (data) {
          callOpsFunctionAndRequest('unlock', 'unlock', "POST", '', data);
        },

        set: function(updates) {
          setUser(updates);
          $http({
            method: "PUT",
            url: '/api/v3/user',
            data: updates,
          })
          .then(function () {
            save();
            $rootScope.$emit('userSynced');
          })
        },

        reroll: function () {
          callOpsFunctionAndRequest('reroll', 'reroll', "POST");
        },

        rebirth: function () {
          callOpsFunctionAndRequest('rebirth', 'rebirth', "POST");
        },

        reset: function () {
          callOpsFunctionAndRequest('reset', 'reset', "POST");
        },

        releaseBoth: function () {
          callOpsFunctionAndRequest('releaseBoth', 'releaseBoth', "POST");
        },

        releaseMounts: function () {
          callOpsFunctionAndRequest('releaseMounts', 'releaseMounts', "POST");
        },

        releasePets: function () {
          callOpsFunctionAndRequest('releasePets', 'releasePets', "POST");
        },

        addWebhook: function (data) {
          callOpsFunctionAndRequest('addWebhook', 'webhook', "POST", '', data, data.body);
        },

        updateWebhook: function (data) {
          callOpsFunctionAndRequest('updateWebhook', 'webhook', "PUT", data.params.id, data, data.body);
        },

        deleteWebhook: function (data) {
          callOpsFunctionAndRequest('deleteWebhook', 'webhook', "DELETE", data.params.id, data, data.body);
        },

        sleep: function () {
          callOpsFunctionAndRequest('sleep', 'sleep', "POST");
        },

        blockUser: function (data) {
          callOpsFunctionAndRequest('blockUser', 'block', "POST", data.params.uuid, data);
        },

        online: function (status) {
          if (status===true) {
            settings.online = true;
            // syncQueue();
          } else {
            settings.online = false;
          };
        },

        authenticate: function (uuid, token, cb) {
          if (uuid && token) {
            var offset = moment().zone(); // eg, 240 - this will be converted on server as -(offset/60)
            $http.defaults.headers.common['x-api-user'] = uuid;
            $http.defaults.headers.common['x-api-key'] = token;
            $http.defaults.headers.common['x-user-timezoneOffset'] = offset;
            authenticated = true;
            settings.auth.apiId = uuid;
            settings.auth.apiToken = token;
            settings.online = true;
            save();
            sync().then(function () {
              if (user.preferences.timezoneOffset !== offset)
                userServices.set({'preferences.timezoneOffset': offset});
              if (cb) cb();
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
        },

        sync: function(){
          userServices.log({});
          return sync();
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
        var search = $location.search($window.location.search.substring(1)).$$search; // so we use this fugly hack instead
        if (search.err) return alert(search.err);
        if (search._id && search.apiToken) {
          userServices.authenticate(search._id, search.apiToken, function(){
            $window.location.href = '/';
          });
        } else {
          var isStaticOrSocial = $window.location.pathname.match(/^\/(static|social)/);
          if (!isStaticOrSocial){
            localStorage.clear();
            $location.path('/logout');
          }
        }
      } else {
        userServices.authenticate(settings.auth.apiId, settings.auth.apiToken)
      }

      return userServices;
    }
]);
