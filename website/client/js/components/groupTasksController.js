habitrpg.controller('GroupTasksCtrl', ['$scope', 'Shared', 'Tasks', function ($scope, Shared, Tasks) {
    $scope.editTask = Tasks.editTask;

    function addTask (addTo, listDef, group) {
      var task = Shared.taskDefaults({text: listDef.newTask, type: listDef.type});
      //If the group has not been created, we bulk add tasks on save
      if (group._id) Tasks.createGroupTasks(group._id, task);
      if (!group[task.type + 's']) group[task.type + 's'] = [];
      group[task.type + 's'].unshift(task);
      delete listDef.newTask;
    };

    $scope.addTask = function(addTo, listDef, group) {
      if (listDef.bulk) {
        var tasks = listDef.newTask.split(/[\n\r]+/);
        //Reverse the order of tasks so the tasks will appear in the order the user entered them
        tasks.reverse();
        _.each(tasks, function(t) {
          listDef.newTask = t;
          addTask(addTo, listDef, group);
        });
        listDef.bulk = false;
      } else {
        addTask(addTo, listDef, group);
      }
    }

    $scope.removeTask = function(task, group) {
      if (!confirm(window.env.t('sureDelete', {taskType: window.env.t(task.type), taskText: task.text}))) return;
      //We only pass to the api if the group exists, otherwise, the tasks only exist on the client
      if (group._id) Tasks.deleteTask(task._id);
      var index = group[task.type + 's'].indexOf(task);
      group[task.type + 's'].splice(index, 1);
    };

    $scope.saveTask = function(task){
      Tasks.updateTask(task._id, task);
      task._editing = false;
    }

    $scope.toggleBulk = function(list) {
      if (typeof list.bulk === 'undefined') {
        list.bulk = false;
      }
      list.bulk = !list.bulk;
      list.focus = true;
    };

    $scope.shouldShow = function(task, list, prefs){
      return true;
    };

    $scope.canEdit = function(task) {
      return true;
    };
  }]);
