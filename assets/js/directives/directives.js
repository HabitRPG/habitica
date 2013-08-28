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

/**
 * Directive that executes an expression when the element it is applied to loses focus.
 */
habitrpg.directive('taskBlur', function() {
  return function(scope, elem, attrs) {
    elem.bind('blur', function() {
      scope.$apply(attrs.taskBlur);
    });
  };
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
habitrpg.directive('sort', function (User) {
  return ['$scope', '$rootScope', 'element', 'attrs', 'ngModel',
    function($scope, $rootScope, element, attrs, ngModel) {
      $(element).sortable({
        axis: "y",
        start: function (event, ui) {
          ui.item.data('startIndex', ui.item.index());
        },
        stop: function (event, ui) {
          var taskType = $rootScope.taskContext.type;
          var startIndex = ui.item.data('startIndex');
          var task = User.user[taskType][startIndex];
          User.log({op: 'sortTask', data: task, from: startIndex, to: ui.item.index()});
        }
      });
  }]
});