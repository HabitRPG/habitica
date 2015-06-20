'use strict';

angular
  .module('habitrpg')
  .factory('Tasks', tasksFactory);

tasksFactory.$inject = [
  '$rootScope',
  'Shared',
  'User'
];

function tasksFactory($rootScope, Shared, User) {

  function editTask(task) {
    task._editing = !task._editing;
    task._tags = !User.user.preferences.tagsCollapsed;
    task._advanced = !User.user.preferences.advancedCollapsed;
    if($rootScope.charts[task.id]) $rootScope.charts[task.id] = false;
  }

  function cloneTask(task) {
    var clonedTask = _.cloneDeep(task);
    clonedTask = _cleanUpTask(clonedTask);

    return Shared.taskDefaults(clonedTask);
  }

  function _cleanUpTask(task) {
    var keysToRemove = ['_id', 'completed', 'date', 'dateCompleted', 'dateCreated', 'history', 'id', 'streak'];
    var cleansedTask = _.omit(task, keysToRemove);

    // Copy checklists but reset to uncomplete and assign new id
    _(cleansedTask.checklist).forEach(function(item) {
      item.completed = false;
      item.id = Shared.uuid();
    });

    if (cleansedTask.type !== 'reward') {
      delete cleansedTask.value;
    }

    return cleansedTask;
  }

  return {
    editTask: editTask,
    cloneTask: cloneTask
  };
}
