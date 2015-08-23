'use strict';

(function(){

  angular
    .module('habitrpg')
    .directive('closeMenu', closeMenu);

  function closeMenu() {
    return {
      restrict: 'A',
      link: function($scope, element, attrs) {
        element.on('click', function(event) {
          $scope._expandedMenu = null;
          $scope.$apply()
        });
      }
    }
  }
}());
