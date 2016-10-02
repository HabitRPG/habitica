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
  .factory('User', ['$rootScope', '$http', '$location', '$window', 'STORAGE_USER_ID', 'STORAGE_SETTINGS_ID', 'Notification', 'ApiUrl', 'Tasks', 'Tags', 'Content', 'UserNotifications',
    function($rootScope, $http, $location, $window, STORAGE_USER_ID, STORAGE_SETTINGS_ID, Notification, ApiUrl, Tasks, Tags, Content, UserNotifications) {
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

      user._wrapped = false;

      function syncUserTasks (tasks) {
        user.habits = [];
        user.todos = [];
        user.dailys = [];
        user.rewards = [];

        // Order tasks based on tasksOrder
        var groupedTasks = _(tasks)
          .groupBy('type')
          .forEach(function (tasksOfType, type) {
            var order = user.tasksOrder[type + 's'];
            var orderedTasks = new Array(tasksOfType.length);
            var unorderedTasks = []; // what we want to add later

            tasksOfType.forEach(function (task, index) {
              var taskId = task._id;
              var i = order[index] === taskId ? index : order.indexOf(taskId);
              if (i === -1) {
                unorderedTasks.push(task);
              } else {
                orderedTasks[i] = task;
              }
            });

            // Remove empty values from the array and add any unordered task
            user[type + 's'] = _.compact(orderedTasks).concat(unorderedTasks);
          }).value();
      }

      function sync() {
        var tasks;

        return $http({
          method: "GET",
          url: '/api/v3/user/',
          ignoreLoadingBar: $rootScope.appLoaded !== true,
        })
        .then(function (response) {
          if (response.data.message) Notification.text(response.data.message);

          _.extend(user, response.data.data);

          if (!user.filters) {
            user.filters = {};
          }

          if (!user._wrapped) {
            // This wraps user with `ops`, which are functions shared both on client and mobile. When performed on client,
            // they update the user in the browser and then send the request to the server, where the same operation is
            // replicated. We need to wrap each op to provide a callback to send that operation
            $window.habitrpgShared.wrap(user);
            _.each(user.ops, function(op,k){
              user.ops[k] = function(req){
                try {
                  op(req);
                } catch (err) {
                  Notification.text(err.message);
                  return;
                }
              }
            });
          }

          return Tasks.getUserTasks();
        })
        // refresh all but completed todos
        .then(function (response) {
          tasks = response.data.data;

          // only refresh completed todos if the user has the completed tabs list open
          if ($rootScope.lists && $rootScope.$state && $rootScope.$state.current.name == 'tasks' && _.find($rootScope.lists, {'type':'todo'}).view == 'complete') {
            return Tasks.getUserTasks(true)
          }
        })
        // refresh completed todos
        .then(function (response) {
          if (response) {
            tasks.push.apply(tasks, response.data.data);
          }

          Tasks.loadedCompletedTodos = Boolean(response);
        })
        .then(function() {
          syncUserTasks(tasks);
          if ($rootScope.$state && $rootScope.$state.current.name=='options.social.inbox' && user.inbox.newMessages > 0) {
            userServices.clearNewMessages();
          }
          $rootScope.$emit('userSynced');
          $rootScope.appLoaded = true;
          $rootScope.$emit('userUpdated', user);
        });
      }

      var save = function () {
        localStorage.setItem(STORAGE_SETTINGS_ID, JSON.stringify(settings));
        localStorage.removeItem(STORAGE_USER_ID); // TODO remember to remove once it's been live for a few days
      };

      function callOpsFunctionAndRequest (opName, endPoint, method, paramString, opData) {
        if (!opData) opData = {};

        var clientResponse;

        try {
          var args = [user];
          if (opName === 'rebirth' || opName === 'reroll' || opName === 'reset') {
            args.push(user.habits.concat(user.dailys).concat(user.rewards).concat(user.todos));
          }

          args.push(opData);
          clientResponse = habitrpgShared.ops[opName].apply(null, args);
        } catch (err) {
          Notification.text(err.message);
          return;
        }

        var clientMessage = clientResponse[1];

        if (clientMessage) {
          Notification.text(clientMessage);
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
          data: body,
        })
        .then(function (response) {
          if (response.data.message && response.data.message !== clientMessage) {
            Notification.text(response.data.message);
          }
          if (opName === 'openMysteryItem') {
            var openedItem = clientResponse[0];
            var text = Content.gear.flat[openedItem.key].text();
            Notification.drop(env.t('messageDropMysteryItem', {dropText: text}), openedItem);
          }
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
          if (_.isArray(data.body)) {
            data.body.forEach(function (task) {
              user.ops.addTask({body: task});
            });
          } else {
            user.ops.addTask(data);
          }
          Tasks.createUserTasks(data.body);
        },

        score: function (data) {
          try {
            $window.habitrpgShared.ops.scoreTask({user: user, task: data.params.task, direction: data.params.direction}, data.params);
          } catch (err) {
            Notification.text(err.message);
            return;
          }

          Tasks.scoreTask(data.params.task._id, data.params.direction).then(function (res) {
            var tmp = res.data.data._tmp || {}; // used to notify drops, critical hits and other bonuses
            var crit = tmp.crit;
            var drop = tmp.drop;
            var quest = tmp.quest;

            if (crit) {
              var critBonus = crit * 100 - 100;
              Notification.crit(critBonus);
            }

            if (quest && user.party.quest && user.party.quest.key) {
              var userQuest = Content.quests[user.party.quest.key];
              if (quest.progressDelta && userQuest.boss) {
                Notification.quest('questDamage', quest.progressDelta.toFixed(1));
              } else if (quest.collection && userQuest.collect) {
                Notification.quest('questCollection', quest.collection);
              }
            }

            if (drop) {
              var text, notes, type;
              $rootScope.playSound('Item_Drop');

              // Note: For Mystery Item gear, drop.type will be 'head', 'armor', etc
              // so we use drop.notificationType below.

              if (drop.type !== 'gear' && drop.type !== 'Quest' && drop.notificationType !== 'Mystery') {
                if (drop.type === 'Food') {
                  type = 'food';
                } else if (drop.type === 'HatchingPotion') {
                  type = 'hatchingPotions';
                } else {
                  type = drop.type.toLowerCase() + 's';
                }
                if(!user.items[type][drop.key]){
                  user.items[type][drop.key] = 0;
                }
                user.items[type][drop.key]++;
              }

              if (drop.type === 'HatchingPotion'){
                text = Content.hatchingPotions[drop.key].text();
                notes = Content.hatchingPotions[drop.key].notes();
                Notification.drop(env.t('messageDropPotion', {dropText: text, dropNotes: notes}), drop);
              } else if (drop.type === 'Egg'){
                text = Content.eggs[drop.key].text();
                notes = Content.eggs[drop.key].notes();
                Notification.drop(env.t('messageDropEgg', {dropText: text, dropNotes: notes}), drop);
              } else if (drop.type === 'Food'){
                text = Content.food[drop.key].text();
                notes = Content.food[drop.key].notes();
                Notification.drop(env.t('messageDropFood', {dropArticle: drop.article, dropText: text, dropNotes: notes}), drop);
              } else if (drop.type === 'Quest') {
                $rootScope.selectedQuest = Content.quests[drop.key];
                $rootScope.openModal('questDrop', {controller:'PartyCtrl', size:'sm'});
              } else {
                // Keep support for another type of drops that might be added
                Notification.drop(drop.dialog);
              }

              // Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'acquire item','itemName':after.key,'acquireMethod':'Drop'});
            }
          });
        },

        sortTask: function (data) {
          user.ops.sortTask(data);
          Tasks.moveTask(data.params.id, data.query.to);
        },

        updateTask: function (task, data) {
          $window.habitrpgShared.ops.updateTask(task, data);
          Tasks.updateTask(task._id, data.body);
        },

        deleteTask: function (data) {
          user.ops.deleteTask(data);
          Tasks.deleteTask(data.params.id);
        },

        readNotification: function (notificationId) {
          UserNotifications.readNotification(notificationId);
        },

        addTag: function(data) {
          user.ops.addTag(data);
          Tags.createTag(data.body);
        },

        updateTag: function(data) {
          user.ops.updateTag(data);
          Tags.updateTag(data.params.id, data.body);
        },

        sortTag: function (data) {
          var fromId = user.tags[data.query.from].id;
          user.ops.sortTag(data);
          Tags.sortTag(fromId, data.query.to);
        },

        deleteTag: function(data) {
          user.ops.deleteTag(data);
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

        setCustomDayStart: function (dayStart) {
          $http({
            method: "POST",
            url: 'api/v3/user/custom-day-start',
            data: {
              dayStart: dayStart
            }
          })
          .then(function (response) {
            Notification.text(response.data.data.message);
            sync();
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

        buyArmoire: function () {
          $http({
            method: "POST",
            url: '/api/v3/user/buy-armoire',
          })
          .then(function (response) {
            Notification.text(response.data.message);
            sync();
          })
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
          callOpsFunctionAndRequest('releaseBoth', 'release-both', "POST");
        },

        releaseMounts: function () {
          callOpsFunctionAndRequest('releaseMounts', 'release-mounts', "POST");
        },

        releasePets: function () {
          callOpsFunctionAndRequest('releasePets', 'release-pets', "POST");
        },

        addWebhook: function (data) {
          return $http({
            method: 'POST',
            url: '/api/v3/user/webhook',
            data: data,
          }).then(function (response) {
            var webhook = response.data.data;
            user.webhooks.push(webhook);
          });
        },

        updateWebhook: function (webhook, index) {
          return $http({
            method: 'PUT',
            url: '/api/v3/user/webhook/' + webhook.id,
            data: webhook,
          }).then(function (response) {
            user.webhooks[index] = response.data.data;
          });
        },

        deleteWebhook: function (webhook, index) {
          return $http({
            method: 'DELETE',
            url: '/api/v3/user/webhook/' + webhook.id,
          }).then(function () {
            user.webhooks.splice(index, index + 1);
          });
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

        syncUserTasks: syncUserTasks,

        save: save,

        settings: settings
      };

      //load settings if we have them
      var storedSettings;
      try {
        storedSettings = localStorage.getItem(STORAGE_SETTINGS_ID) || {};
        storedSettings = JSON.parse(storedSettings);
      } catch (e) {
        storedSettings = {};
      }

      if (storedSettings.auth && storedSettings.auth.apiId && storedSettings.auth.apiToken) {
        //use extend here to make sure we keep object reference in other angular controllers
        _.extend(settings, storedSettings);

        //if settings were saved while fetch was in process reset the flag.
        settings.fetching = false;
      //create and load if not
      } else {
        localStorage.setItem(STORAGE_SETTINGS_ID, JSON.stringify(defaultSettings));
        _.extend(settings, defaultSettings);
      }

      //If user does not have ApiID that forward him to settings.
      if (!settings || !settings.auth || !settings.auth.apiId || !settings.auth.apiToken) {
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
            $window.location.href = '/logout';
          }
        }
      } else {
        userServices.authenticate(settings.auth.apiId, settings.auth.apiToken)
      }

      return userServices;
    }
]);
