habitrpg.controller('GroupTasksCtrl', ['$scope', 'Shared', 'Tasks', 'User', function ($scope, Shared, Tasks, User) {
    function handleGetGroupTasks (response) {
      var group = $scope.obj;

      var tasks = response.data.data;

      if (tasks.length === 0) return;

      // @TODO: We need to get the task information from createGroupTasks rather than resyncing
      group['habits'] = [];
      group['dailys'] = [];
      group['todos'] = [];
      group['rewards'] = [];

      tasks.forEach(function (element, index, array) {
        if (!$scope.group[element.type + 's']) $scope.group[element.type + 's'] = [];
        $scope.group[element.type + 's'].unshift(element);
      })

      $scope.loading = false;
    };

    $scope.refreshTasks = function () {
      $scope.loading = true;
      Tasks.getGroupTasks($scope.group._id)
        .then(handleGetGroupTasks);
    };

    /*
     * Task Edit functions
     */

    $scope.toggleBulk = Tasks.toggleBulk;
    $scope.cancelTaskEdit = Tasks.cancelTaskEdit;

    $scope.editTask = function (task, user, taskStatus) {
      Tasks.editTask(task, user, taskStatus, $scope);
    };

    function addTask (listDef, taskTexts) {
      taskTexts.forEach(function (taskText) {
        var task = Shared.taskDefaults({text: taskText, type: listDef.type});

        //If the group has not been created, we bulk add tasks on save
        var group = $scope.obj;
        if (!group._id) return;

        Tasks.createGroupTasks(group._id, task)
          .then(function () {
            // Set up default group info on task. @TODO: Move this to Tasks.createGroupTasks
            task.group = {
              id: group._id,
              approval: {required: false, approved: false, requested: false},
              assignedUsers: [],
            };

            if (!group[task.type + 's']) group[task.type + 's'] = [];
            group[task.type + 's'].unshift(task);

            return Tasks.getGroupTasks($scope.group._id);
          })
          .then(handleGetGroupTasks);
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
      // Check if we have a lingering checklist that the enter button did not trigger on
      var lastIndex = task._edit.checklist.length - 1;
      var lastCheckListItem = task._edit.checklist[lastIndex];
      if (lastCheckListItem && !lastCheckListItem.id && lastCheckListItem.text) {
        Tasks.addChecklistItem(task._id, lastCheckListItem)
          .then(function (response) {
            task._edit.checklist[lastIndex] = response.data.data.checklist[lastIndex];
            task.checklist[lastIndex] = response.data.data.checklist[lastIndex];
            Tasks.saveTask(task, stayOpen, isSaveAndClose);
            Tasks.updateTask(task._id, task);
          });
      } else {
        Tasks.saveTask (task, stayOpen, isSaveAndClose);
        Tasks.updateTask(task._id, task);
      }
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

     $scope.addChecklistItem = function addChecklistItemToUI(task, $event, $index) {
       if (task._edit.checklist[$index].justAdded) return;
       task._edit.checklist[$index].justAdded = true;
       if (!task._edit.checklist[$index].id) {
         Tasks.addChecklistItem (task._id, task._edit.checklist[$index])
          .then(function (response) {
            task._edit.checklist[$index] = response.data.data.checklist[$index];
          })
       }
       Tasks.addChecklistItemToUI(task, $event, $index);
     };

     $scope.removeChecklistItem = function (task, $event, $index, force) {
       if (!task._edit.checklist[$index].id) return;
       Tasks.removeChecklistItem (task._id, task._edit.checklist[$index].id);
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

    $scope.checkGroupAccess = function (group) {
      if (!group || !group.leader) return true;
      if (User.user._id !== group.leader._id) return false;
      return true;
    };

    /*
     * Task Details
     */
      $scope.taskPopover = function (task) {
        if (task.popoverOpen) return '';

        var content = task.notes;

        if ($scope.group) {
          var memberIdToProfileNameMap = _.object(_.map($scope.group.members, function(item) {
             return [item.id, item.profile.name]
          }));

          var claimingUsers = [];
          task.group.assignedUsers.forEach(function (userId) {
            claimingUsers.push(memberIdToProfileNameMap[userId]);
          })

          if (claimingUsers.length > 0) content += window.env.t('claimedBy', {claimingUsers: claimingUsers.join(', ')});
        }

        return content;
      };
  }]);
