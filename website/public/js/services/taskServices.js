'use strict';

(function(){
  var TASK_KEYS_TO_REMOVE = ['_id', 'completed', 'date', 'dateCompleted', 'dateCreated', 'history', 'id', 'streak'];

  angular
    .module('habitrpg')
    .factory('Tasks', tasksFactory);

  tasksFactory.$inject = [
    '$rootScope',
    'Shared',
    'User'
  ];

  function tasksFactory($rootScope, Shared, User) {

    function addTask(listDef, fn) {
      if (listDef.bulk) {
        var tasks = listDef.newTask.split(/[\n\r]+/);
        tasks.reverse();
        _.each(tasks, function(task) {
          fn(task);
        });
        listDef.bulk = false;
      } else {
        var task = listDef.newTask;
        fn(task);
      }
      delete listDef.newTask;
      delete listDef.focus;
    }

    function toggleBulk(list) {
      if (typeof list.bulk === 'undefined') {
        list.bulk = false;
      }
      list.bulk = !list.bulk;
      list.focus = true;
    };

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
      var cleansedTask = _.omit(task, TASK_KEYS_TO_REMOVE);

      // Copy checklists but reset to uncomplete and assign new id
      _(cleansedTask.checklist).forEach(function(item) {
        item.completed = false;
        item.id = Shared.uuid();
      }).value();

      if (cleansedTask.type !== 'reward') {
        delete cleansedTask.value;
      }

      return cleansedTask;
    }

    return {
      addTask: addTask,
      toggleBulk: toggleBulk,
      editTask: editTask,
      cloneTask: cloneTask
    };
  }
})();
