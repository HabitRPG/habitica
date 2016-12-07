habitrpg.controller('GroupTasksCtrl', ['$scope', 'Shared', 'Tasks', 'User', function ($scope, Shared, Tasks, User) {
    $scope.editTask = Tasks.editTask;
    $scope.toggleBulk = Tasks.toggleBulk;
    $scope.cancelTaskEdit = Tasks.cancelTaskEdit;

    function addTask (listDef, taskTexts) {
      taskTexts.forEach(function (taskText) {
        var task = Shared.taskDefaults({text: taskText, type: listDef.type});

        //If the group has not been created, we bulk add tasks on save
        var group = $scope.obj;
        if (group._id) Tasks.createGroupTasks(group._id, task);

        // Set up default group info on task. @TODO: Move this to Tasks.createGroupTasks
        task.group = {
          id: group._id,
          approval: {required: false, approved: false, requested: false},
          assignedUsers: [],
        };

        if (!group[task.type + 's']) group[task.type + 's'] = [];
        group[task.type + 's'].unshift(task);

        // @TODO: We need to get the task information from createGroupTasks rather than resyncing
        group['habits'] = [];
        group['dailys'] = [];
        group['todos'] = [];
        group['rewards'] = [];

        Tasks.getGroupTasks($scope.group._id)
          .then(function (response) {
            var tasks = response.data.data;
            tasks.forEach(function (element, index, array) {
              if (!$scope.group[element.type + 's']) $scope.group[element.type + 's'] = [];
              $scope.group[element.type + 's'].push(element);
            })

            // Reverse the list so the latest tasks are on top
            group['habits'] = group['habits'].reverse();
            group['dailys'] = group['dailys'].reverse();
            group['todos'] = group['todos'].reverse();
            group['rewards'] = group['rewards'].reverse();
          });

      });
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

     $scope.removeChecklistItem = function (task, $event, $index, force) {
       if (task.checklist[$index].id) Tasks.removeChecklistItem (task._id, task.checklist[$index].id);
       Tasks.removeChecklistItemFromUI(task, $event, $index, force);
     };

     $scope.swapChecklistItems = Tasks.swapChecklistItems;

     $scope.navigateChecklist = Tasks.navigateChecklist;

     $scope.checklistCompletion = Tasks.checklistCompletion;

     $scope.collapseChecklist = function (task) {
       Tasks.collapseChecklist(task);
       //@TODO: Currently the api save of the task is separate, so whenever we need to save the task we need to call the respective api
       Tasks.updateTask(task._id, task);
     };
  }]);
