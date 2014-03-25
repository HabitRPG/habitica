"use strict";

/* Make user and settings available for everyone through root scope.
 */

habitrpg.controller("RootCtrl", ['$scope', '$rootScope', '$location', 'User', '$http', '$state', '$stateParams', 'Notification', 'Groups', 'Shared', 'Content', '$modal', '$timeout',
  function($scope, $rootScope, $location, User, $http, $state, $stateParams, Notification, Groups, Shared, Content, $modal, $timeout) {
    var user = User.user;

    var initSticky = _.once(function(){
      if (window.env.IS_MOBILE || User.user.preferences.stickyHeader === false) return;
      $('.header-wrap').sticky({topSpacing:0});
    })
    $rootScope.$on('userUpdated',initSticky);

    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams){
        if (!!fromState.name) window.ga && ga('send', 'pageview', {page: '/#/'+toState.name});
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
      if(user && user.backer && user.backer.npc)
        style += ' label-npc';
      if(user && user.contributor && user.contributor.level)
        style += ' label-contributor-'+user.contributor.level;
      return style;
    }

    // count pets, mounts collected totals, etc
    $rootScope.countExists = function(items) {return _.reduce(items,function(m,v){return m+(v?1:0)},0)}

    $rootScope.petCount = Shared.countPets(null, User.user.items.pets);

    $rootScope.$watch('user.items.pets', function(pets){ 
      $rootScope.petCount = Shared.countPets($rootScope.countExists(pets), User.user.items.pets);
    }, true);

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

    // Open a modal from a template expression (like ng-click,...)
    // Otherwise use the proper $modal.open
    $rootScope.openModal = function(template, options){//controller, scope, keyboard, backdrop){
      if (!options) options = {};
      if (options.track) window.ga && ga('send', 'event', 'button', 'click', options.track);
      return $modal.open({
        templateUrl: 'modals/' + template + '.html',
        controller: options.controller, // optional
        scope: options.scope, // optional
        keyboard: (options.keyboard === undefined ? true : options.keyboard), // optional
        backdrop: (options.backdrop === undefined ? true : options.backdrop) // optional
      });
    }

    $rootScope.dismissAlert = function() {
      $rootScope.set({'flags.newStuff':false});
    }

    $rootScope.notPorted = function(){
      alert(window.env.t('notPorted'));
    }

    $rootScope.dismissErrorOrWarning = function(type, $index){
      $rootScope.flash[type].splice($index, 1);
    }

    $rootScope.showStripe = function(subscription) {
      StripeCheckout.open({
        key: window.env.STRIPE_PUB_KEY,
        address: false,
        amount: 500,
        name: subscription ? window.env.t('subscribe') : window.env.t('checkout'),
        description: subscription ?
          window.env.t('buySubsText') :
          window.env.t('donationDesc'),
        panelLabel: subscription ? window.env.t('subscribe') : window.env.t('checkout'),
        token: function(data) {
          var url = '/stripe/checkout';
          if (subscription) url += '?plan=basic_earned';
          $scope.$apply(function(){
            $http.post(url, data).success(function() {
              window.location.reload(true);
            }).error(function(err) {
              alert(err);
            });
          })
        }
      });
    }

    $scope.cancelSubscription = function(){
      if (!confirm(window.env.t('sureCancelSub'))) return;
      window.location.href = '/' + user.purchased.plan.paymentMethod.toLowerCase() + '/subscribe/cancel?_id=' + user._id + '&apiToken=' + user.apiToken;
    }

    $scope.contribText = function(contrib, backer){
      if (!contrib && !backer) return;
      if (backer && backer.npc) return backer.npc;
      var l = contrib && contrib.level;
      if (l && l > 0) {
        var level = (l < 3) ? window.env.t('friend') : (l < 5) ? window.env.t('elite') : (l < 7) ? window.env.t('champion') : (l < 8) ? window.env.t('legendary') : window.env.t('heroic');
        return level + ' ' + contrib.text;
      }
    }

    $rootScope.charts = {};
    $rootScope.toggleChart = function(id, task) {
      var history = [], matrix, data, chart, options;
      switch (id) {
        case 'exp':
          $rootScope.charts.exp = !$rootScope.charts.exp;
          history = User.user.history.exp;
          break;
        case 'todos':
          $rootScope.charts.todos = !$rootScope.charts.todos;
          history = User.user.history.todos;
          break;
        default:
          $rootScope.charts[id] = !$rootScope.charts[id];
          history = task.history;
          if (task && task._editing) task._editing = false;
      }
      matrix = [['Date', 'Score']];
      _.each(history, function(obj) {
        matrix.push([moment(obj.date).format('MM/DD/YY'), obj.value]);
      });
      data = google.visualization.arrayToDataTable(matrix);
      options = {
        title: window.env.t('history'),
        backgroundColor: {
          fill: 'transparent'
        },
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

      $http.post('/api/v2/user/class/cast/'+spell.key+'?targetType='+type+'&targetId='+targetId)
      .success(function(){
        var msg = window.env.t('youCast', {spell: spell.text}); 
        switch (type) {
         case 'task': msg = window.env.t('youCastTarget', {spell: spell.text, target: target.text});break;
         case 'user': msg = window.env.t('youCastTarget', {spell: spell.text, target: target.profile.name});break;
         case 'party': msg = window.env.t('youCastParty', {spell: spell.text});break;
        }
        Notification.text(msg);
      });

    }

    $rootScope.castCancel = function(){
      $rootScope.applyingAction = false;
      $scope.spell = null;
    }
  }
]);
