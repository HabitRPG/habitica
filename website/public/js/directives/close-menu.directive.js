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
          if ($scope.$parent._expandedMenu) {
            $scope.$parent._expandedMenu.menu = null;
          }
          if ($scope._expandedMenu) {
            $scope._expandedMenu.menu = null;
          }
          $scope.$apply()
        });
      }
    }
  }
}());
