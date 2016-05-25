'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('focusElement', focusElement);

  focusElement.$inject = ['$timeout'];

  /**
   * Directive that places focus on the element it is applied to when the
   * expression it binds to evaluates to true.
   */

  function focusElement($timeout) {
    return function($scope, elem, attrs) {
      $scope.$watch(attrs.focusElement, function(newVal) {
        if (newVal) {
          $timeout(function() {
            elem[0].focus();
          }, 0, false);
        }
      });
    }
  }
}());
