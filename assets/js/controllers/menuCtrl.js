'use strict';

/**
 * The menu controller:
 * - sets the menu options, should we do it dynamic so it generates the menu like: width = 1/elements * 100 ?
 * - exposes the model to the template and provides event handlers
 */

habitrpg.controller('MenuCtrl',
  ['$scope', '$rootScope', '$location', 'User',
  function($scope, $rootScope, $location, User) {

  $scope.swiperight = function(){
    $scope.menuopen = true;
  }

  $scope.swipeleft = function(){
    $scope.menuopen = false;
  }

  $scope.menuClick = function(button) {
    $scope.menuopen = false;
    $location.url(button.link);
  }

  /**
   * Show title according to the location
   */
  $rootScope.$on('$routeChangeSuccess', function(){
    var found = _.find($scope.nav, function(obj){
      return obj.link === $location.path();
    });
    if (found) {
      $rootScope.taskContext = {
        name: found.name,
        type: found.link.substr(1) // remove trailing /
      };
      $rootScope.menuopen = false;
    }
  });

  $scope.nav = [
    { link:'/habit',     name:'Habits',  lowercase:'habits'   },
    { link:'/daily',     name:'Dailies', lowercase:'dailies'  },
    { link:'/todo',      name:'Todos',   lowercase:'todos'    },
    { link:'/reward',    name:'Rewards', lowercase:'rewards'  },
    { link:'/profile',   name:'Profile', lowercase:'profile'  },
    { link:'/settings',  name:'Settings',lowercase:'settings' },
    { link:'/help',      name:'Help',    lowercase:'help' }
  ]

  $scope.refreshing = function () {
    return User.settings.fetching ? "spin" : ""
  };

  $scope.queueLength = function () {
    return User.settings.sync.queue.length || User.settings.sync.sent.length
  };

  $scope.stats = User.user.stats;

  $('#main_nav').css('height', $(window).height())
  $('#wrapper').css('height', $(window).height())

  }
]);
