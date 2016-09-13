'use strict';

var TASK_KEYS_TO_REMOVE = ['_id', 'completed', 'date', 'dateCompleted', 'history', 'id', 'streak', 'createdAt', 'challenge'];

angular.module('habitrpg')
.factory('Tasks', ['$rootScope', 'Shared', '$http',
  function tasksFactory($rootScope, Shared, $http) {
    function addTasks(listDef, addTaskFn) {
      var tasks = listDef.newTask;

      if (listDef.bulk) {
        tasks = tasks.split(/[\n\r]+/);
        // Reverse the order of tasks so the tasks
        // will appear in the order the user entered them
        tasks.reverse();
        listDef.bulk = false;
      } else {
        tasks = [tasks];
      }

      addTaskFn(listDef, tasks);

      delete listDef.newTask;
      delete listDef.focus;
    }

    function toggleBulk (list) {
      list.bulk = !list.bulk;
      list.focus = true;
    };

    function getUserTasks (getCompletedTodos) {
      var url = '/api/v3/tasks/user';

      if (getCompletedTodos) url += '?type=completedTodos';

      return $http({
        method: 'GET',
        url: url,
        ignoreLoadingBar: $rootScope.appLoaded !== true,
      });
    };

    function createUserTasks (taskDetails) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/user',
        data: taskDetails,
      });
    };

    function getChallengeTasks (challengeId) {
      return $http({
        method: 'GET',
        url: '/api/v3/tasks/challenge/' + challengeId,
      });
    };

    function createChallengeTasks (challengeId, tasks) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/challenge/' + challengeId,
        data: tasks,
      });
    };

    function getTask (taskId) {
      return $http({
        method: 'GET',
        url: '/api/v3/tasks/' + taskId,
      });
    };

    function updateTask (taskId, taskDetails) {
      return $http({
        method: 'PUT',
        url: '/api/v3/tasks/' + taskId,
        data: taskDetails,
      });
    };

    function deleteTask (taskId) {
      return $http({
        method: 'DELETE',
        url: '/api/v3/tasks/' + taskId,
      });
    };

    function scoreTask (taskId, direction) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/score/' + direction,
      });
    };

    function moveTask (taskId, position) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/move/to/' + position,
      });
    };

    function addChecklistItem (taskId, checkListItem) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/checklist',
        data: checkListItem,
      });
    };

    function scoreCheckListItem (taskId, itemId) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/checklist/' + itemId + '/score',
      });
    };

    function updateChecklistItem (taskId, itemId, itemDetails) {
      return $http({
        method: 'PUT',
        url: '/api/v3/tasks/' + taskId + '/checklist/' + itemId,
        data: itemDetails,
      });
    };

    function removeChecklistItem (taskId, itemId) {
      return $http({
        method: 'DELETE',
        url: '/api/v3/tasks/' + taskId + '/checklist/' + itemId,
      });
    };

    function addTagToTask (taskId, tagId) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/tags/' + tagId,
      });
    };

    function removeTagFromTask (taskId, tagId) {
      return $http({
        method: 'DELETE',
        url: '/api/v3/tasks/' + taskId + '/tags/' + tagId,
      });
    };

    function unlinkOneTask (taskId, keep) { // single task
      if (!keep) {
        keep = "keep";
      }

      return $http({
        method: 'POST',
        url: '/api/v3/tasks/unlink-one/' + taskId + '?keep=' + keep,
      });
    };

    function unlinkAllTasks (challengeId, keep) { // all tasks
      if (!keep) {
        keep = "keep-all";
      }

      return $http({
        method: 'POST',
        url: '/api/v3/tasks/unlink-all/' + challengeId + '?keep=' + keep,
      });
    };

    function clearCompletedTodos () {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/clearCompletedTodos',
      });
    };

    function editTask(task, user) {
      task._editing = !task._editing;
      task._tags = !user.preferences.tagsCollapsed;
      task._advanced = !user.preferences.advancedCollapsed;
      if($rootScope.charts[task._id]) $rootScope.charts[task.id] = false;
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
      addTasks: addTasks,
      toggleBulk: toggleBulk,
      getUserTasks: getUserTasks,
      loadedCompletedTodos: false,
      createUserTasks: createUserTasks,
      getChallengeTasks: getChallengeTasks,
      createChallengeTasks: createChallengeTasks,
      getTask: getTask,
      updateTask: updateTask,
      deleteTask: deleteTask,
      scoreTask: scoreTask,
      moveTask: moveTask,
      addChecklistItem: addChecklistItem,
      scoreCheckListItem: scoreCheckListItem,
      updateChecklistItem: updateChecklistItem,
      removeChecklistItem: removeChecklistItem,
      addTagToTask: addTagToTask,
      removeTagFromTask: removeTagFromTask,
      unlinkOneTask: unlinkOneTask,
      unlinkAllTasks: unlinkAllTasks,
      clearCompletedTodos: clearCompletedTodos,
      editTask: editTask,
      cloneTask: cloneTask
    };
  }]);
