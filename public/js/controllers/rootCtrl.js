"use strict";

/* Make user and settings available for everyone through root scope.
 */

habitrpg.controller("RootCtrl", ['$scope', '$rootScope', '$location', 'User', '$http', '$state', '$stateParams', 'Notification', 'Groups', 'Shared', 'Content',
  function($scope, $rootScope, $location, User, $http, $state, $stateParams, Notification, Groups, Shared, Content) {
    var user = User.user;

    var initSticky = _.once(function(){
      if (window.env.IS_MOBILE || User.user.preferences.stickyHeader === false) return;
      $('.header-wrap').sticky({topSpacing:0});
    })
    $rootScope.$on('userUpdated',initSticky);

    $rootScope.modals = {};
    $rootScope.modals.achievements = {};
    $rootScope.User = User;
    $rootScope.user = user;
    $rootScope.moment = window.moment;
    $rootScope._ = window._;
    $rootScope.settings = User.settings;
    $rootScope.Shared = Shared;
    $rootScope.Content = Content;

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

    $rootScope.dismissAlert = function() {
      $rootScope.modals.newStuff = false;
      $rootScope.set({'flags.newStuff':false});
    }

    $rootScope.notPorted = function(){
      alert("This feature is not yet ported from the original site.");
    }

    $rootScope.dismissErrorOrWarning = function(type, $index){
      $rootScope.flash[type].splice($index, 1);
    }

    $rootScope.showStripe = function() {
      StripeCheckout.open({
        key: window.env.STRIPE_PUB_KEY,
        address: false,
        amount: 500,
        name: "Checkout",
        description: "Buy 20 Gems, Disable Ads, Support the Developers",
        panelLabel: "Checkout",
        token: function(data) {
          $scope.$apply(function(){
            $http.post("/api/v2/user/buy-gems", data)
              .success(function() {
                window.location.href = "/";
              }).error(function(err) {
                alert(err);
              });
          })
        }
      });
    }

    $scope.contribText = function(contrib, backer){
      if (!contrib && !backer) return;
      if (backer && backer.npc) return backer.npc;
      var l = contrib && contrib.level;
      if (l && l > 0) {
        var level = (l < 3) ? 'Friend' : (l < 5) ? 'Elite' : (l < 7) ? 'Champion' : (l < 8) ? 'Legendary' : 'Heroic';
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
        title: 'History',
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
      if (User.user.stats.mp < spell.mana) return Notification.text("Not enough mana.");
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
      if ($scope.spell.target != type) return Notification.text("Invalid target");
      $scope.spell.cast(User.user, target);
      User.save();

      var spell = $scope.spell;
      var targetId = (type == 'party' || type == 'self') ? '' : type == 'task' ? target.id : target._id;
      $scope.spell = null;
      $rootScope.applyingAction = false;

      $http.post('/api/v2/user/class/cast/'+spell.key+'?targetType='+type+'&targetId='+targetId)
      .success(function(){
        var msg = "You cast " + spell.text;
        switch (type) {
          case 'task': msg += ' on ' + target.text;break;
          case 'user': msg += ' on ' + target.profile.name;break;
          case 'party': msg += ' on the Party';break;
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
