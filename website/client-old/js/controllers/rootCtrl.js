"use strict";

/* Make user and settings available for everyone through root scope.
 */

habitrpg.controller("RootCtrl", ['$scope', '$rootScope', '$location', 'User', '$http', '$state', '$stateParams', 'Notification', 'Groups', 'Shared', 'Content', '$modal', '$timeout', 'ApiUrl', 'Payments','$sce','$window','Analytics','TAVERN_ID', 'Pusher',
  function($scope, $rootScope, $location, User, $http, $state, $stateParams, Notification, Groups, Shared, Content, $modal, $timeout, ApiUrl, Payments, $sce, $window, Analytics, TAVERN_ID, Pusher) {
    var user = User.user;
    var IGNORE_SCROLL_PAGES = {
        'options.social.challenges.detail': true,
        'options.social.challenges': true
    };

    // Setup page once user is synced
    var clearAppLoadedListener = $rootScope.$watch('appLoaded', function (after) {
      if (after === true) {
        // Initialize sticky header
        $timeout(function () {
          if (window.env.IS_MOBILE || User.user.preferences.stickyHeader === false) return;
          $('.header-wrap').sticky({topSpacing:0});
        });

        // Remove listener
        clearAppLoadedListener();
      }
    });

    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams){
        $rootScope.pageTitle = $state.current.title;

        if (!($state.current.name in IGNORE_SCROLL_PAGES)) {
            $window.scrollTo(0, 0);
        }

        if (!!fromState.name) Analytics.track({'hitType':'pageview','eventCategory':'navigation','eventAction':'navigate','page':'/#/'+toState.name});
        if (toState.name=='options.social.inbox' && User.user.inbox && User.user.inbox.newMessages > 0) {
          User.clearNewMessages();
        }
      });

    $rootScope.appLoaded = false; // also used to indicate when the user is fully loaded
    $rootScope.TAVERN_ID = TAVERN_ID;
    $rootScope.User = User;
    $rootScope.user = user;
    $rootScope.moment = window.moment;
    $rootScope._ = window._;
    $rootScope.settings = User.settings;
    $rootScope.Shared = Shared;
    $rootScope.Content = Content;
    $rootScope.Analytics = Analytics;
    $rootScope.env = window.env;
    $rootScope.Math = Math;
    $rootScope.Groups = Groups;
    $rootScope.toJson = angular.toJson;
    $rootScope.Payments = Payments;
    $rootScope.userNotifications = [];
    $rootScope.party = {}; // to be extended later with real data

    // Angular UI Router
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // indexOf helper
    $scope.indexOf = function(haystack, needle){
      return haystack && ~haystack.indexOf(needle);
    }

    // styling helpers
    $rootScope.userLevelStyle = function(user,style){
      style = style || '';
      var npc = (user && user.backer && user.backer.npc) ? user.backer.npc : '';
      var level = (user && user.contributor && user.contributor.level) ? user.contributor.level : '';
      style += $scope.userLevelStyleFromLevel(level,npc,style)
      return style;
    }
    $scope.userAdminGlyphiconStyle = function(user,style){
      style = style || '';
      if(user && user.contributor && user.contributor.level)
        style += $scope.userAdminGlyphiconStyleFromLevel(user.contributor.level,style)
      return style;
    }
    $scope.userLevelStyleFromLevel = function(level,npc,style){
      style = style || '';
      if(npc)
        style += ' label-npc';
      if(level)
        style += ' label-contributor-'+level;
      return style;
    }
    $scope.userAdminGlyphiconStyleFromLevel = function(level,style){
      style = style || '';
      if(level)
        if(level==8)
          style += ' glyphicon glyphicon-star'; // moderator
        if(level==9)
          style += ' glyphicon icon-crown'; // staff
      return style;
    }

    $rootScope.playSound = function(id){
      if (!user.preferences.sound || user.preferences.sound == 'off') return;
      var theme = user.preferences.sound;
      var file =  'assets/audio/' + theme + '/' + id;
      document.getElementById('oggSource').src = file + '.ogg';
      document.getElementById('mp3Source').src = file + '.mp3';
      document.getElementById('sound').load();
    }

    // count pets, mounts collected totals, etc
    $rootScope.countExists = function(items) {return _.reduce(items,function(m,v){return m+(v?1:0)},0)}

    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

    $rootScope.set = User.set;
    $rootScope.authenticated = User.authenticated;

    var forceLoadBailey = function(template, options) {
      $http.get('/new-stuff.html')
        .success(function(data) {
          $rootScope.latestBaileyMessage = $sce.trustAsHtml(data);
          $modal.open({
            templateUrl: 'modals/' + template + '.html',
            controller: options.controller, // optional
            scope: options.scope, // optional
            resolve: options.resolve, // optional
            keyboard: (options.keyboard === undefined ? true : options.keyboard), // optional
            backdrop: (options.backdrop === undefined ? true : options.backdrop), // optional
            size: options.size, // optional, 'sm' or 'lg'
            windowClass: options.windowClass // optional
          });
        });
    };

    // Open a modal from a template expression (like ng-click,...)
    // Otherwise use the proper $modal.open
    $rootScope.openModal = function(template, options){//controller, scope, keyboard, backdrop){
      if (!options) options = {};
      if (options.track) Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':options.track});
      if(template === 'newStuff') return forceLoadBailey(template, options);
      return $modal.open({
        templateUrl: 'modals/' + template + '.html',
        controller: options.controller, // optional
        scope: options.scope, // optional
        resolve: options.resolve, // optional
        keyboard: (options.keyboard === undefined ? true : options.keyboard), // optional
        backdrop: (options.backdrop === undefined ? true : options.backdrop), // optional
        size: options.size, // optional, 'sm' or 'lg'
        windowClass: options.windowClass // optional
      });
    }

    $rootScope.dismissAlert = function() {
      $rootScope.set({'flags.newStuff':false});
    }

    $rootScope.acceptCommunityGuidelines = function() {
      $rootScope.set({'flags.communityGuidelinesAccepted':true});
    }

    $rootScope.notPorted = function(){
      alert(window.env.t('notPorted'));
    }

    $rootScope.dismissErrorOrWarning = function(type, $index){
      $rootScope.flash[type].splice($index, 1);
    }

    $scope.contribText = function(contrib, backer){
      if (!contrib && !backer) return;
      if (backer && backer.npc) return backer.npc;
      var l = contrib && contrib.level;
      if (l && l > 0) {
        var level = (l < 3) ? window.env.t('friend') : (l < 5) ? window.env.t('elite') : (l < 7) ? window.env.t('champion') : (l < 8) ? window.env.t('legendary') : (l < 9) ? window.env.t('guardian') : window.env.t('heroic');
        return level + ' ' + contrib.text;
      }
    }

    $rootScope.charts = {};
    var resizeChartFunctions = {};
    $rootScope.toggleChart = function(id, task) {
      var history = [], matrix, data;
      switch (id) {
        case 'exp':
          history = User.user.history.exp;
          $rootScope.charts.exp = (history.length == 0) ? false : !$rootScope.charts.exp;
          break;
        case 'todos':
          history = User.user.history.todos;
          $rootScope.charts.todos = (history.length == 0) ? false : !$rootScope.charts.todos;
          break;
        default:
          history = task.history;
          $rootScope.charts[id] = (history.length == 0) ? false : !$rootScope.charts[id];
          if (task && task._editing) task._editing = false;
      }

      if ($rootScope.charts[id] && !resizeChartFunctions[id]) {
        resizeChartFunctions[id] = function() {
          drawChart(id, data);
        };
      } else if (!$rootScope.charts[id]) {
        delete resizeChartFunctions[id];
      }

      matrix = [[env.t('date'), env.t('score')]];
      _.each(history, function(obj) {
        matrix.push([moment(obj.date).format(User.user.preferences.dateFormat.toUpperCase().replace('YYYY','YY') ), obj.value]);
      });
      data = google.visualization.arrayToDataTable(matrix);

      drawChart(id, data);
    };

    function drawChart(id, data) {
      var chart, width, options;

      if (id === 'exp') {
        width = $('.row').width() - 20;
      } else if (id === 'todos') {
        width = $('.task-column.todos').width();
      } else {
        width = $('.task-text').width() - 20;
      }

      options = {
        title: window.env.t('history'),
        backgroundColor: {
          fill: 'transparent'
        },
        hAxis: {
          slantedText: true,
          slantedTextAngle: 90,
          textStyle: {
            fontSize: 12
          }
        },
        vAxis: {
          format: 'short',
          textStyle: {
            fontSize: 12
          }
        },
        width: width,
        height: 270,
        chartArea: {
          left: 50,
          top: 30,
          right: 20,
          bottom: 65
        },
        legend: {
          position: 'none'
        }
      };

      chart = new google.visualization.LineChart($("." + id + "-chart")[0]);
      chart.draw(data, options);
    }

    $rootScope.getGearArray = function(set){
      var flatGearArray = _.toArray(Content.gear.flat);

      var filteredArray = _.where(flatGearArray, {gearSet: set});

      return filteredArray;
    }

    // @TODO: Extract equip and purchase into equipment service
    $rootScope.equip = function(itemKey, equipType) {
      equipType = equipType || (user.preferences.costume ? 'costume' : 'equipped');
      var equipParams = {
         type: equipType,
         key: itemKey
      };

      User.equip({ params: equipParams });
    }

    $rootScope.purchase = function(type, item){
      if (type == 'special') return User.buySpecialSpell({params:{key:item.key}});

      var gems = user.balance * 4;
      var price = item.value;
      var message = "";

      var itemName = window.env.t(Content.itemList[type].localeKey)

      if (Content.itemList[type].isEquipment) {
        var eligibleForPurchase = _canBuyEquipment(item.key);
        if (!eligibleForPurchase) return false;

        // @TODO: Attach gemValue to content so we don't have to do this
        price = ((((item.specialClass == "wizard") && (item.type == "weapon")) || item.gearSet == "animal") + 1);
        type = 'gear';
      }

      if (gems < price) return $rootScope.openModal('buyGems');

      if (type === 'quests') {
        if (item.previous) {message = window.env.t('alreadyEarnedQuestReward', {priorQuest: Content.quests[item.previous].text()})}
        else if (item.lvl) {message = window.env.t('alreadyEarnedQuestLevel', {level: item.lvl})}
      }

      message += window.env.t('buyThis', {text: itemName, price: price, gems: gems});
      if ($window.confirm(message))
        User.purchase({params:{type:type,key:item.key}});
    };

    function _canBuyEquipment(itemKey) {
      if (user.items.gear.owned[itemKey]) {
        $window.alert(window.env.t('messageAlreadyOwnGear'));
      } else if (user.items.gear.owned[itemKey] === false) {
        $window.alert(window.env.t('messageAlreadyPurchasedGear'));
      } else {
        return true;
      }
    }

    function _questProgress() {
      var user = $scope.user;
      if (user.party.quest) {
        var userQuest = Content.quests[user.party.quest.key];

        if (!userQuest) {
          return 0;
        }
        if (userQuest.boss && user.party.quest.progress.up > 0) {
          return user.party.quest.progress.up;
        }
        if (userQuest.collect && user.party.quest.progress.collectedItems > 0) {
          return user.party.quest.progress.collectedItems;
        }
      }
      return 0;
    }

    /*
     ------------------------
     Spells
     ------------------------
    */
    $scope.castStart = function(spell) {
      if (User.user.stats.mp < spell.mana) return Notification.text(window.env.t('notEnoughMana'));

      if (spell.immediateUse && User.user.stats.gp < spell.value)
        return Notification.text('Not enough gold.');

      $rootScope.applyingAction = true;
      $scope.spell = spell;
      if (spell.target == 'self') {
        $scope.castEnd(null, 'self');
      } else if (spell.target == 'party') {
        Groups.party()
          .then(function (party) {
            party = (_.isArray(party) ? party : []).concat(User.user);
            $scope.castEnd(party, 'party');
          })
          .catch(function (party) { // not in a party, act as a solo party
            if (party && party.type === 'party') {
              party = [User.user];
              $scope.castEnd(party, 'party');
            }
          });
      } else if (spell.target == 'tasks') {
        var tasks = User.user.habits.concat(User.user.dailys).concat(User.user.rewards).concat(User.user.todos);
        // exclude challenge tasks
        tasks = tasks.filter(function (task) {
          if (!task.challenge) return true;
          return (!task.challenge.id || task.challenge.broken);
        });
        $scope.castEnd(tasks, 'tasks');
      }
    }

    $scope.castEnd = function(target, type, $event){
      var beforeQuestProgress = _questProgress();

      if (!$rootScope.applyingAction) return 'No applying action';
      $event && ($event.stopPropagation(),$event.preventDefault());

      if ($scope.spell.target != type) return Notification.text(window.env.t('invalidTarget'));
      $scope.spell.cast(User.user, target);
      User.save();

      var spell = $scope.spell;
      var targetId = target ? target._id : null;
      $scope.spell = null;
      $rootScope.applyingAction = false;

      var spellUrl = ApiUrl.get() + '/api/v3/user/class/cast/' + spell.key;
      if (targetId) spellUrl += '?targetId=' + targetId;

      $http.post(spellUrl)
        .success(function(){ // TODO response will always include the modified data, no need to sync!
          var msg = window.env.t('youCast', {spell: spell.text()});

          switch (type) {
            case 'task': msg = window.env.t('youCastTarget', {spell: spell.text(), target: target.text});break;
            case 'user': msg = window.env.t('youCastTarget', {spell: spell.text(), target: target.profile.name});break;
            case 'party': msg = window.env.t('youCastParty', {spell: spell.text()});break;
          }
          Notification.markdown(msg);
          var questProgress = _questProgress() - beforeQuestProgress;
          if (questProgress > 0) {
            var userQuest = Content.quests[user.party.quest.key];
            if (userQuest.boss) {
              Notification.quest('questDamage', questProgress.toFixed(1));
            } else if (quest.collection && userQuest.collect) {
              Notification.quest('questCollection', questProgress);
            }
          }
          User.sync();
        });
    }

    $rootScope.castCancel = function(){
      $rootScope.applyingAction = false;
      $scope.spell = null;
    }

    // Because our angular-ui-router uses anchors for urls (/#/options/groups/party), window.location.href=... won't
    // reload the page. Perform manually.
    $rootScope.hardRedirect = function(url){
      window.location.href = url;
      setTimeout(function() {
        window.location.reload(false);
      });
    }

    // Universal method for sending HTTP methods
    $rootScope.http = function(method, route, data, alertMsg){
      $http[method](ApiUrl.get() + route, data).success(function(){
        if (alertMsg) Notification.text(window.env.t(alertMsg));
        User.sync();
      });
      // error will be handled via $http interceptor
    }

    // Global Keyevents
    var ctrlKeys = [17, 224, 91];
    $scope.$on("habit:keydown", function (e, keyEvent) {
      if (ctrlKeys.indexOf(keyEvent.keyCode) !== -1) {
        $scope.ctrlPressed = true;
      }
    });

    $scope.$on("habit:keyup", function (e, keyEvent) {
      if (ctrlKeys.indexOf(keyEvent.keyCode) !== -1) {
        $scope.ctrlPressed = false;
      }
    });

    var resizeAllCharts = _.debounce(function () {
      _.each(resizeChartFunctions, function (fn) {
        fn();
      });
    }, 100);
    $(window).resize(resizeAllCharts);
  }
]);
