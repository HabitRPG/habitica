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
})

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
      start: function (event, ui) {
        ui.item.data('startIndex', ui.item.index());
      },
      stop: function (event, ui) {
        var taskType = angular.element(ui.item[0]).scope().task.type + 's';
        var startIndex = ui.item.data('startIndex');
        var task = User.user[taskType][startIndex];
        // FIXME - this is a really inconsistent way of API handling. we need to fix the batch-update route
        User.log({op: 'sortTask', data: _.defaults({from: startIndex, to: ui.item.index()}, task)});
      }
    });
  }
}]);
