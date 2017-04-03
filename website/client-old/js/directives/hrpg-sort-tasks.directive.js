'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('hrpgSortTasks', hrpgSortTasks);

  hrpgSortTasks.$inject = [
    'User',
    'Tasks',
  ];

  function hrpgSortTasks(User, Tasks) {
    return function($scope, element, attrs, ngModel) {
      $(element).sortable({
        axis: "y",
        distance: 5,
        start: function (event, ui) {
          ui.item.data('startIndex', ui.item.index());
        },
        stop: function (event, ui) {
          var task = angular.element(ui.item[0]).scope().task;
          var startIndex = ui.item.data('startIndex');

          // Check if task is a group original task
          if (task.group.id && !task.userId) {
            Tasks.moveGroupTask(task._id, ui.item.index());
            return;
          }

          User.sortTask({
            params: { id: task._id, taskType: task.type },
            query: {
              from: startIndex,
              to: ui.item.index()
            }
          });
        }
      });
    }
  }
}());
