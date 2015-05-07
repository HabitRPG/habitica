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
          task._dateString = moment(task.startDate).format('YYYY-MM-DD');
          if($rootScope.charts[task.id]) $rootScope.charts[task.id] = false;
        };
      }],
      link: function(scope, element, attrs) {
        // $scope.obj needs to come from controllers, so we can pass by ref
        scope.main = attrs.main;
        scope.modal = attrs.modal;
        var dailiesView;
        if(User.user.preferences.dailyDueDefaultView) {
          dailiesView = "remaining";
        } else {
          dailiesView = "all";
        }
        $rootScope.lists = [
          {
            header: window.env.t('habits'),
            type: 'habit',
            placeHolder: window.env.t('newHabit'),
            placeHolderBulk: window.env.t('newHabitBulk'),
            view: "all"
          }, {
            header: window.env.t('dailies'),
            type: 'daily',
            placeHolder: window.env.t('newDaily'),
            placeHolderBulk: window.env.t('newDailyBulk'),
            view: dailiesView
          }, {
            header: window.env.t('todos'),
            type: 'todo',
            placeHolder: window.env.t('newTodo'),
            placeHolderBulk: window.env.t('newTodoBulk'),
            view: "remaining"
          }, {
            header: window.env.t('rewards'),
            type: 'reward',
            placeHolder: window.env.t('newReward'),
            placeHolderBulk: window.env.t('newRewardBulk'),
            view: "all"
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

habitrpg.directive('hrpgSortTasks', ['User', function(User) {
  return function($scope, element, attrs, ngModel) {
    $(element).sortable({
      axis: "y",
      distance: 5,
      start: function (event, ui) {
        ui.item.data('startIndex', ui.item.index());
      },
      stop: function (event, ui) {
        var task = angular.element(ui.item[0]).scope().task,
          startIndex = ui.item.data('startIndex');
        User.user.ops.sortTask({ params: {id: task.id}, query: {from: startIndex, to: ui.item.index()} });
      }
    });
  }
}]);

habitrpg.directive('hrpgSortChecklist', ['User', function(User) {
  return function($scope, element, attrs, ngModel) {
    $(element).sortable({
      axis: "y",
      distance: 5,
      start: function (event, ui) {
        ui.item.data('startIndex', ui.item.index());
      },
      stop: function (event, ui) {
        var task = angular.element(ui.item[0]).scope().task,
          startIndex = ui.item.data('startIndex');
        //$scope.saveTask(task, true);
		$scope.swapChecklistItems(task, startIndex, ui.item.index());
      }
    });
  }
}]);

habitrpg.directive('hrpgSortTags', ['User', function(User) {
  return function($scope, element, attrs, ngModel) {
    $(element).sortable({
      start: function (event, ui) {
        ui.item.data('startIndex', ui.item.index());
      },
      stop: function (event, ui) {
        User.user.ops.sortTag({query:{ from: ui.item.data('startIndex'), to:ui.item.index() }});
      }
    });
  }
}]);

habitrpg
  .directive( 'popoverHtmlPopup', ['$sce', function($sce) {
    return {
        restrict: 'EA',
        replace: true,
        scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
        link: function(scope, element, attrs) {
          scope.$watch('content', function(value, oldValue) {
            scope.unsafeContent = $sce.trustAsHtml(scope.content);
          });
        },
        templateUrl: 'template/popover/popover-html.html'
    };
  }])
  .directive( 'popoverHtml', [ '$compile', '$timeout', '$parse', '$window', '$tooltip',
    function ( $compile, $timeout, $parse, $window, $tooltip ) {
      return $tooltip( 'popoverHtml', 'popover', 'click' );
    }
  ])
  .run(["$templateCache", function($templateCache) {
    $templateCache.put("template/popover/popover-html.html",
      "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"arrow\"></div>\n" +
      "\n" +
      "  <div class=\"popover-inner\">\n" +
      "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
      "      <div class=\"popover-content\" ng-bind-html=\"unsafeContent\" style=\"word-wrap: break-word\">    </div>\n" +
      "  </div>\n" +
      "</div>\n");
  }]);

habitrpg.directive('focusMe', function($timeout, $parse) {
 return {
   link: function(scope, element, attrs) {
     var model = $parse(attrs.focusMe);
     scope.$watch(model, function(value) {
       $timeout(function() {
         element[0].focus();
       });
     });
   }
 };
});
