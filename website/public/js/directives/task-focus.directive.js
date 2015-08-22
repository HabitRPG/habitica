'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('taskFocus', taskFocus);

  taskFocus.$inject = ['$timeout'];

  /**
   * Directive that places focus on the element it is applied to when the
   * expression it binds to evaluates to true.
   */

  function taskFocus($timeout) {
    return function($scope, elem, attrs) {
      $scope.$watch(attrs.taskFocus, function(newVal) {
        if (newVal) {
          $timeout(function() {
            elem[0].focus();
          }, 0, false);
        }
      });
    }
  }
}());
