habitrpg.controller('GroupTasksCtrl', ['$scope', 'Shared', 'Tasks', 'User', function ($scope, Shared, Tasks, User) {
    $scope.editTask = Tasks.editTask;
    $scope.toggleBulk = Tasks.toggleBulk;
    $scope.cancelTaskEdit = Tasks.cancelTaskEdit;

    function addTask (listDef, task) {
      var task = Shared.taskDefaults({text: task, type: listDef.type});
      //If the group has not been created, we bulk add tasks on save
      var group = $scope.obj;
      if (group._id) Tasks.createGroupTasks(group._id, task);
      if (!group[task.type + 's']) group[task.type + 's'] = [];
      group[task.type + 's'].unshift(task);
      delete listDef.newTask;
    };

    $scope.addTask = function(listDef) {
      Tasks.addTasks(listDef, addTask);
    };

    $scope.removeTask = function(task, group) {
      if (!Tasks.removeTask(task)) return;
      //We only pass to the api if the group exists, otherwise, the tasks only exist on the client
      if (group._id) Tasks.deleteTask(task._id);
      var index = group[task.type + 's'].indexOf(task);
      group[task.type + 's'].splice(index, 1);
    };

    $scope.saveTask = function(task, stayOpen, isSaveAndClose) {
      Tasks.saveTask (task, stayOpen, isSaveAndClose);
      Tasks.updateTask(task._id, task);
    };

    $scope.shouldShow = function(task, list, prefs){
      return true;
    };

    $scope.canEdit = function(task) {
      return true;
    };

    /*
    ------------------------
    Tags
    ------------------------
    */
    $scope.updateTaskTags = function (tagId, task) {
      var tagIndex = task.tags.indexOf(tagId);
      if (tagIndex === -1) {
        Tasks.addTagToTask(task._id, tagId);
        task.tags.push(tagId);
      } else {
        Tasks.removeTagFromTask(task._id, tagId);
        task.tags.splice(tagIndex, 1);
      }
    };

     /*
      ------------------------
      Checklists
      ------------------------
      */
     $scope.addChecklist = Tasks.addChecklist;

     $scope.addChecklistItem = Tasks.addChecklistItemToUI;

     $scope.removeChecklistItem = Tasks.removeChecklistItemFromUI;

     $scope.swapChecklistItems = Tasks.swapChecklistItems;

     $scope.navigateChecklist = Tasks.navigateChecklist;

     $scope.checklistCompletion = Tasks.checklistCompletion;

     $scope.collapseChecklist = function (task) {
       Tasks.collapseChecklist(task);
       //@TODO: Currently the api save of the task is separate, so whenever we need to save the task we need to call the respective api
       Tasks.updateTask(task._id, task);
     };
  }]);
