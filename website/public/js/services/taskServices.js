'use strict';

angular
  .module('habitrpg')
  .factory('Tasks', tasksFactory);

tasksFactory.$inject = [
  '$rootScope',
  'User',
  'Shared'
];

function tasksFactory($rootScope, User, Shared) {

  function editTask(task) {
    task._editing = !task._editing;
    task._tags = !User.user.preferences.tagsCollapsed;
    task._advanced = !User.user.preferences.advancedCollapsed;
    if($rootScope.charts[task.id]) $rootScope.charts[task.id] = false;
  }

  function cloneTasks(tasksToClone, arrayWithClonedTasks) {
    var len = tasksToClone.length;
    for (var i = 0; i < len; i+=1) {
      var tmpTask = {};
      var task = tasksToClone[i];
      for( var property in task ) {
        if ( property !== "_id" && property !== "id" && property !== "dateCreated" ) {
          tmpTask[property] = task[property];
        }
      }
      var newTask = Shared.taskDefaults(tmpTask);
      arrayWithClonedTasks[newTask.type].push(newTask);
    }
  }

  return {
    editTask: editTask,
    cloneTasks: cloneTasks,
  };
}
