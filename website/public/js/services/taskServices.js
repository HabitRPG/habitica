'use strict';

angular
  .module('habitrpg')
  .factory('Tasks', tasksFactory);

tasksFactory.$inject = [
  '$rootScope',
  'User'
];

function tasksFactory($rootScope, User) {

  function editTask(task) {
    task._editing = !task._editing;
    task._tags = !User.user.preferences.tagsCollapsed;
    task._advanced = !User.user.preferences.advancedCollapsed;
    if($rootScope.charts[task.id]) $rootScope.charts[task.id] = false;
  }

  return {
    editTask: editTask
  };
}
