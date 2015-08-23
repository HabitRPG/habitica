'use strict';

(function(){

  angular
    .module('habitrpg')
    .directive('expandMenu', expandMenu);

  function expandMenu() {
    return {
      restrict: 'A',
      link: function($scope, element, attrs) {
        element.on('click', function(event) {
          $scope._expandedMenu = ($scope._expandedMenu === attrs.menu) ? null : attrs.menu;
          $scope.$apply()
        });
      }
    }
  }
}());
