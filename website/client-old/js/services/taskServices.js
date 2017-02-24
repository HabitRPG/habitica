'use strict';

var TASK_KEYS_TO_REMOVE = ['_id', 'completed', 'date', 'dateCompleted', 'history', 'id', 'streak', 'createdAt', 'challenge'];

angular.module('habitrpg')
.factory('Tasks', ['$rootScope', 'Shared', '$http', 'Notification', 'Content', '$window',
  function tasksFactory($rootScope, Shared, $http, Notification, Content, $window) {
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

    function removeTask (task) {
      if (!confirm(window.env.t('sureDelete', {taskType: window.env.t(task.type), taskText: task.text}))) {
        return false;
      };
      task._edit = undefined;
      return true;
    }

    function saveTask (task, stayOpen, isSaveAndClose) {
      if (task._edit) {
        angular.copy(task._edit, task);
      }
      task._edit = undefined;

      if (task.checklist) {
        task.checklist = _.filter(task.checklist, function (i) {
          return !!i.text
        });
      }

      if (!stayOpen) task._editing = false;

      if (isSaveAndClose) {
        $("#task-" + task._id).parent().children('.popover').removeClass('in');
      }
    }

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

    function getGroupTasks (groupId) {
      return $http({
        method: 'GET',
        url: '/api/v3/tasks/group/' + groupId,
      });
    };

    function createGroupTasks (groupId, taskDetails) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/group/' + groupId,
        data: taskDetails,
      });
    };

    function getGroupApprovals (groupId) {
      return $http({
        method: 'GET',
        url: '/api/v3/approvals/group/' + groupId,
      });
    };

    function approve (taskId, userId) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/approve/' + userId,
      });
    };

    function getTask (taskId) {
      return $http({
        method: 'GET',
        url: '/api/v3/tasks/' + taskId,
      });
    };

    function updateTask (taskId, taskDetails) {
      var taskDetailsToSend = _.omit(taskDetails, ['challenge', 'group', 'history', 'reminders', 'tags'])

      return $http({
        method: 'PUT',
        url: '/api/v3/tasks/' + taskId,
        data: taskDetailsToSend,
      });
    };

    function deleteTask (taskId) {
      return $http({
        method: 'DELETE',
        url: '/api/v3/tasks/' + taskId,
      });
    };

    function undoTask (taskId) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/undo',
      });
    };

    function handleScoreTaskResponse (res, user) {
      var tmp = res.data.data._tmp || {}; // used to notify drops, critical hits and other bonuses
      var crit = tmp.crit;
      var drop = tmp.drop;
      var quest = tmp.quest;

      if (crit) {
        var critBonus = crit * 100 - 100;
        Notification.crit(critBonus);
      }

      if (quest && user.party.quest && user.party.quest.key) {
        var userQuest = Content.quests[user.party.quest.key];
        if (quest.progressDelta && userQuest.boss) {
          Notification.quest('questDamage', quest.progressDelta.toFixed(1));
        } else if (quest.collection && userQuest.collect) {
          Notification.quest('questCollection', quest.collection);
        }
      }

      if (drop) {
        var text, notes, type;
        $rootScope.playSound('Item_Drop');

        // Note: For Mystery Item gear, drop.type will be 'head', 'armor', etc
        // so we use drop.notificationType below.

        if (drop.type !== 'gear' && drop.type !== 'Quest' && drop.notificationType !== 'Mystery') {
          if (drop.type === 'Food') {
            type = 'food';
          } else if (drop.type === 'HatchingPotion') {
            type = 'hatchingPotions';
          } else {
            type = drop.type.toLowerCase() + 's';
          }
          if(!user.items[type][drop.key]){
            user.items[type][drop.key] = 0;
          }
          user.items[type][drop.key]++;
        }

        if (drop.type === 'HatchingPotion'){
          text = Content.hatchingPotions[drop.key].text();
          notes = Content.hatchingPotions[drop.key].notes();
          Notification.drop(env.t('messageDropPotion', {dropText: text, dropNotes: notes}), drop);
        } else if (drop.type === 'Egg'){
          text = Content.eggs[drop.key].text();
          notes = Content.eggs[drop.key].notes();
          Notification.drop(env.t('messageDropEgg', {dropText: text, dropNotes: notes}), drop);
        } else if (drop.type === 'Food'){
          text = Content.food[drop.key].text();
          notes = Content.food[drop.key].notes();
          Notification.drop(env.t('messageDropFood', {dropArticle: drop.article, dropText: text, dropNotes: notes}), drop);
        } else if (drop.type === 'Quest') {
          $rootScope.selectedQuest = Content.quests[drop.key];
          $rootScope.openModal('questDrop', {controller:'PartyCtrl', size:'sm'});
        } else {
          // Keep support for another type of drops that might be added
          Notification.drop(drop.dialog);
        }

        // Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'acquire item','itemName':after.key,'acquireMethod':'Drop'});
      }
    }

    function scoreTask (task, direction, user) {
      try {
        $window.habitrpgShared.ops.scoreTask({user: user, task: task, direction: direction}, {params:{task: task, direction:direction}});
      } catch (err) {
        Notification.text(err.message);
        return;
      }

      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + task._id + '/score/' + direction,
      });
    };

    function moveTask (taskId, position) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/move/to/' + position,
      });
    };

    function moveGroupTask (taskId, position) {
      return $http({
        method: 'POST',
        url: '/api/v3/group-tasks/' + taskId + '/move/to/' + position,
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

    function assignTask (taskId, userId) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/assign/' + userId,
      });
    };

    function unAssignTask (taskId, userId) {
      return $http({
        method: 'POST',
        url: '/api/v3/tasks/' + taskId + '/unassign/' + userId,
      });
    };

    function editTask(task, user, taskStatus, scopeInc) {
      var modalScope = $rootScope.$new();
      modalScope.task = task;
      modalScope.task._editing = true;
      modalScope.task._tags = !user.preferences.tagsCollapsed;
      modalScope.task._advanced = !user.preferences.advancedCollapsed;
      modalScope.task._edit = angular.copy(task);
      if($rootScope.charts[task._id]) $rootScope.charts[task.id] = false;

      modalScope.taskStatus = taskStatus;
      if (scopeInc) {
        modalScope.saveTask = scopeInc.saveTask;
        modalScope.addChecklist = scopeInc.addChecklist;
        modalScope.addChecklistItem = scopeInc.addChecklistItem;
        modalScope.removeChecklistItem = scopeInc.removeChecklistItem;
        modalScope.swapChecklistItems = scopeInc.swapChecklistItems;
        modalScope.navigateChecklist = scopeInc.navigateChecklist;
        modalScope.checklistCompletion = scopeInc.checklistCompletion;
        modalScope.canEdit = scopeInc.canEdit;
        modalScope.updateTaskTags = scopeInc.updateTaskTags;
        modalScope.obj = scopeInc.obj;
        modalScope.unlink = scopeInc.unlink;
        modalScope.removeTask = scopeInc.removeTask;
      }
      modalScope.cancelTaskEdit = cancelTaskEdit;

      $rootScope.openModal('task-edit', {scope: modalScope })
        .result.catch(function() {
          cancelTaskEdit(task);
        });
    }

    function cancelTaskEdit(task) {
      task._edit = undefined;
      task._editing = false;
    };

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

    /*
     ------------------------
     Checklists
     ------------------------
     */

    function focusChecklist(task, index) {
      window.setTimeout(function(){
        $('#task-' + task._id + ' .checklist-form input[type="text"]')[index].focus();
      });
    }

    function addChecklist(task) {
      task._edit.checklist = [{completed:false, text:""}];
      focusChecklist(task._edit,0);
    }

    function addChecklistItemToUI(task, $event, $index) {
      if (task._edit.checklist[$index].text) {
        if ($index === task._edit.checklist.length - 1) {
          task._edit.checklist.push({ completed: false, text: '' });
        }
        focusChecklist(task._edit, $index + 1);
      } else {
        // TODO Provide UI feedback that this item is still blank
      }
    }

     function removeChecklistItemFromUI(task, $event, $index, force) {
      // Remove item if clicked on trash icon
      if (force) {
        task._edit.checklist.splice($index, 1);
      } else if (!task._edit.checklist[$index].text) {
        // User deleted all the text and is now wishing to delete the item
        // saveTask will prune the empty item
        // Move focus if the list is still non-empty
        if ($index > 0)
          focusChecklist(task._edit, $index-1);
        // Don't allow the backspace key to navigate back now that the field is gone
        $event.preventDefault();
      }
    }

    function swapChecklistItems(task, oldIndex, newIndex) {
      var toSwap = task._edit.checklist.splice(oldIndex, 1)[0];
      task._edit.checklist.splice(newIndex, 0, toSwap);
    }

    function navigateChecklist(task,$index,$event) {
      focusChecklist(task, $event.keyCode == '40' ? $index+1 : $index-1);
    }

    function checklistCompletion(checklist) {
      return _.reduce(checklist,function(m,i){return m+(i.completed ? 1 : 0);},0)
    }

    function collapseChecklist(task) {
      task.collapseChecklist = !task.collapseChecklist;
      saveTask(task, true);
    }

    return {
      addTasks: addTasks,
      toggleBulk: toggleBulk,
      getUserTasks: getUserTasks,
      removeTask: removeTask,
      saveTask: saveTask,
      loadedCompletedTodos: false,
      createUserTasks: createUserTasks,
      getChallengeTasks: getChallengeTasks,
      createChallengeTasks: createChallengeTasks,
      getGroupTasks: getGroupTasks,
      createGroupTasks: createGroupTasks,
      getTask: getTask,
      updateTask: updateTask,
      deleteTask: deleteTask,
      undoTask: undoTask,

      scoreTask: scoreTask,
      handleScoreTaskResponse: handleScoreTaskResponse,
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
      cancelTaskEdit: cancelTaskEdit,
      cloneTask: cloneTask,
      assignTask: assignTask,
      unAssignTask: unAssignTask,

      addChecklist: addChecklist,
      addChecklistItemToUI: addChecklistItemToUI,
      removeChecklistItemFromUI: removeChecklistItemFromUI,
      swapChecklistItems: swapChecklistItems,
      navigateChecklist: navigateChecklist,
      checklistCompletion: checklistCompletion,
      collapseChecklist: collapseChecklist,

      getGroupApprovals: getGroupApprovals,
      approve: approve,
      moveGroupTask: moveGroupTask,
    };
  }]);
