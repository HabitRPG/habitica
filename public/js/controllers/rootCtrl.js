"use strict";

/* Make user and settings available for everyone through root scope.
 */

habitrpg.controller("RootCtrl", ['$scope', '$rootScope', '$location', 'User', '$http', '$state', '$stateParams',
  function($scope, $rootScope, $location, User, $http, $state, $stateParams) {
    $rootScope.modals = {};
    $rootScope.modals.achievements = {};
    $rootScope.User = User;
    $rootScope.user = User.user;
    $rootScope.settings = User.settings;
    $rootScope.Items = window.habitrpgShared.items.items;

    // Angular UI Router
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    // indexOf helper
    $scope.indexOf = function(haystack, needle){
      return haystack && ~haystack.indexOf(needle);
    }

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

    /*
     FIXME this is dangerous, organize helpers.coffee better, so we can group them by which controller needs them,
     and then simply _.defaults($scope, Helpers.user) kinda thing
     */
    _.defaults($rootScope, window.habitrpgShared.algos);
    _.defaults($rootScope, window.habitrpgShared.helpers);

    $rootScope.set = User.set;
    $rootScope.authenticated = User.authenticated;

    $rootScope.dismissAlert = function() {
      $rootScope.modals.newStuff = false;
      $rootScope.set('flags.newStuff',false);
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
            $http.post("/api/v1/user/buy-gems", data)
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
  }
]);
