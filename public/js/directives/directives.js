'use strict';

/**
 * Directive that places focus on the element it is applied to when the expression it binds to evaluates to true.
 */
habitrpg.directive('taskFocus',
  ['$timeout',
  function($timeout) {
    return function(scope, elem, attrs) {
      scope.$watch(attrs.taskFocus, function(newval) {
        if ( newval ) {
          $timeout(function() {
            elem[0].focus();
          }, 0, false);
        }
      });
    };
  }
]);

habitrpg.directive('habitrpgAdsense', function() {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    template: '<div ng-transclude></div>',
    link: function ($scope, element, attrs) {}
  }
});

habitrpg.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = elm[0];

    elm.bind('scroll', function() {
      if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
        scope.$apply(attr.whenScrolled);
      }
    });
  };
});

/**
 * Add sortable
 */
habitrpg.directive('habitrpgSortable', ['User', function(User) {
  return function($scope, element, attrs, ngModel) {
    $(element).sortable({
      axis: "y",
      distance: 5,
      start: function (event, ui) {
        ui.item.data('startIndex', ui.item.index());
      },
      stop: function (event, ui) {
        var taskType = angular.element(ui.item[0]).scope().task.type + 's';
        var startIndex = ui.item.data('startIndex');
        var task = User.user[taskType][startIndex];
        User.user.ops.sortTask({params:{id:task.id},query:{from:startIndex, to:ui.item.index()}});
      }
    });
  }
}]);


habitrpg
  .directive('habitrpgTasks', ['$rootScope', 'User', function($rootScope, User) {
    return {
      restrict: 'EA',
      templateUrl: 'templates/habitrpg-tasks.html',
      //transclude: true,
      //scope: {
      //  main: '@', // true if it's the user's main list
      //  obj: '='
      //},
      controller: ['$scope', '$rootScope', function($scope, $rootScope){
        $scope.editTask = function(task){
          task._editing = !task._editing;
          task._tags = User.user.preferences.tagsCollapsed;
          task._advanced = User.user.preferences.advancedCollapsed;
          if($rootScope.charts[task.id]) $rootScope.charts[task.id] = false;
        };
      }],
      link: function(scope, element, attrs) {
        // $scope.obj needs to come from controllers, so we can pass by ref
        scope.main = attrs.main;
        $rootScope.lists = [
          {
            header: window.env.t('habits'),
            type: 'habit',
            placeHolder: window.env.t('newHabit')
          }, {
            header: window.env.t('dailies'),
            type: 'daily',
            placeHolder: window.env.t('newDaily')
          }, {
            header: window.env.t('todos'),
            type: 'todo',
            placeHolder: window.env.t('newTodo')
          }, {
            header: window.env.t('rewards'),
            type: 'reward',
            placeHolder: window.env.t('newReward')
          }
        ];

      }
    }
  }]);

habitrpg.directive('fromNow', ['$interval', function($interval){
  return function(scope, element, attr){
    var updateText = function(){ element.text(moment(scope.message.timestamp).fromNow()) };
    updateText();
    // Update the counter every 60secs if was sent less than one hour ago otherwise every hour
    // OPTIMIZATION, every time the interval is run, update the interval time
    var intervalTime = moment().diff(scope.message.timestamp, 'minute') < 60 ? 60000 : 3600000;
    var interval = $interval(function(){ updateText() }, intervalTime, false);
    scope.$on('$destroy', function() {
      $interval.cancel(interval);
    });
  }
}]);
