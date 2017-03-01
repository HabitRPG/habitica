'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('task', task);

  task.$inject = [
    'Shared',
    '$modal',
  ];

  function task(Shared, $modal) {
    return {
      restrict: 'E',
      templateUrl: 'templates/task.html',
      scope: true,
      link: function($scope, element, attrs) {
        $scope.getClasses = function (task, user, list, main) {
          return Shared.taskClasses(task, user.filters, user.preferences.dayStart, user.lastCron, list.showCompleted, main);
        }

        $scope.showNoteDetails = function (task) {
          task.popoverOpen = false;

          $modal.open({
            templateUrl: 'modals/task-extra-notes.html',
            controller: function ($scope, task) {
              $scope.task = task;
            },
            resolve: {
              task: function() {
                return task;
              }
            }
          })
        };
      }
    }
  }
}());
