"use strict";

/* Make user and settings available for everyone through root scope.
 */

habitrpg.controller("RootCtrl", ['$scope', '$rootScope', '$location', 'User', '$http', '$state', '$stateParams', 'Notification', 'Groups', 'Shared', 'Content', '$modal', '$timeout', 'ApiUrl', 'Payments','$sce',
  function($scope, $rootScope, $location, User, $http, $state, $stateParams, Notification, Groups, Shared, Content, $modal, $timeout, ApiUrl, Payments,$sce) {
    var user = User.user;

    var initSticky = _.once(function(){
      if (window.env.IS_MOBILE || User.user.preferences.stickyHeader === false) return;
      $('.header-wrap').sticky({topSpacing:0});
    })
    $rootScope.$on('userUpdated',initSticky);

    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams){
        if (!!fromState.name) window.ga && ga('send', 'pageview', {page: '/#/'+toState.name});
        // clear inbox when entering or exiting inbox tab
        if (fromState.name=='options.social.inbox' || toState.name=='options.social.inbox') {
          User.user.ops.update && User.set({'inbox.newMessages':0});
        }
      });

    $rootScope.User = User;
    $rootScope.user = user;
    $rootScope.moment = window.moment;
    $rootScope._ = window._;
    $rootScope.settings = User.settings;
    $rootScope.Shared = Shared;
    $rootScope.Content = Content;
    $rootScope.env = window.env;
    $rootScope.Math = Math;
    $rootScope.Groups = Groups;
    $rootScope.toJson = angular.toJson;
    $rootScope.Payments = Payments;

    // Angular UI Router
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // indexOf helper
    $scope.indexOf = function(haystack, needle){
      return haystack && ~haystack.indexOf(needle);
    }

    // styling helpers
    $scope.userLevelStyle = function(user,style){
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
      var file =  'common/audio/' + theme + '/' + id;
      document.getElementById('oggSource').src = file + '.ogg';
      document.getElementById('mp3Source').src = file + '.mp3';
      document.getElementById('sound').load();
    }

    // count pets, mounts collected totals, etc
    $rootScope.countExists = function(items) {return _.reduce(items,function(m,v){return m+(v?1:0)},0)}

    $rootScope.petCount = Shared.countPets($rootScope.countExists(User.user.items.pets), User.user.items.pets);
    $rootScope.mountCount = Shared.countMounts($rootScope.countExists(User.user.items.mounts), User.user.items.mounts);

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
      if (options.track) window.ga && ga('send', 'event', 'button', 'click', options.track);
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
    $rootScope.toggleChart = function(id, task) {
      var history = [], matrix, data, chart, options;
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
      matrix = [[env.t('date'), env.t('score')]];
      _.each(history, function(obj) {
        matrix.push([moment(obj.date).format(User.user.preferences.dateFormat.toUpperCase().replace('YYYY','YY') ), obj.value]);
      });
      data = google.visualization.arrayToDataTable(matrix);
      options = {
        title: window.env.t('history'),
        backgroundColor: {
          fill: 'transparent'
        },
        hAxis: {slantedText:true, slantedTextAngle: 90},
        height:270,
        width:300
      };
      chart = new google.visualization.LineChart($("." + id + "-chart")[0]);
      chart.draw(data, options);
    };



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
        var party = Groups.party();
        party = (_.isArray(party) ? party : []).concat(User.user);
        $scope.castEnd(party, 'party');
      }
    }

    $scope.castEnd = function(target, type, $event){
      if (!$rootScope.applyingAction) return;
      $event && ($event.stopPropagation(),$event.preventDefault());
      if ($scope.spell.target != type) return Notification.text(window.env.t('invalidTarget'));
      $scope.spell.cast(User.user, target);
      User.save();

      var spell = $scope.spell;
      var targetId = (type == 'party' || type == 'self') ? '' : type == 'task' ? target.id : target._id;
      $scope.spell = null;
      $rootScope.applyingAction = false;

      $http.post(ApiUrl.get() + '/api/v2/user/class/cast/'+spell.key+'?targetType='+type+'&targetId='+targetId)
      .success(function(){
        var msg = window.env.t('youCast', {spell: spell.text()});
        switch (type) {
         case 'task': msg = window.env.t('youCastTarget', {spell: spell.text(), target: target.text});break;
         case 'user': msg = window.env.t('youCastTarget', {spell: spell.text(), target: target.profile.name});break;
         case 'party': msg = window.env.t('youCastParty', {spell: spell.text()});break;
        }
        Notification.text(msg);
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
  }
]);
