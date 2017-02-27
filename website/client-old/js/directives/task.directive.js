'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('task', task);

  task.$inject = [
    'Shared',
  ];

  function task(Shared) {
    return {
      restrict: 'E',
      templateUrl: 'templates/task.html',
      scope: true,
      link: function($scope, element, attrs) {
        $scope.getClasses = function (task, user, list, main) {
          return Shared.taskClasses(task, user.filters, user.preferences.dayStart, user.lastCron, list.showCompleted, main);
        }
      }
    }
  }
}());
