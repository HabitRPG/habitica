'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('focusMe', focusMe);

  focusMe.$inject = [
    '$timeout',
    '$parse'
  ];

  function focusMe($timeout, $parse) {
    return {
      link: function($scope, element, attrs) {
        var model = $parse(attrs.focusMe);
        $scope.$watch(model, function(value) {
          $timeout(function() {
            element[0].focus();
          });
        });
      }
    }
  }
}());
