"use strict";

habitrpg.controller("TasksCtrl", ['$scope', '$rootScope', '$location', 'User','Notification', '$http', 'ApiUrl', '$timeout', 'Content', 'Shared', 'Guide', 'Tasks', 'Analytics',
  function($scope, $rootScope, $location, User, Notification, $http, ApiUrl, $timeout, Content, Shared, Guide, Tasks, Analytics) {
    $scope.obj = User.user; // used for task-lists
    $scope.user = User.user;

    var CTRL_KEYS = [17, 224, 91];

    $scope.armoireCount = function(gear) {
      return Shared.count.remainingGearInSet(gear, 'armoire');
    };

    $scope.score = function(task, direction) {
      switch (task.type) {
          case 'reward':
              playRewardSound(task);
              break;
          case 'daily':
              $rootScope.playSound('Daily');
              break;
          case 'todo':
              $rootScope.playSound('ToDo');
              break;
          default:
              if (direction === 'down') $rootScope.playSound('Minus_Habit');
              else if (direction === 'up') $rootScope.playSound('Plus_Habit');
      }
      User.score({params:{task: task, direction:direction}});
      Analytics.updateUser();
    };

    function addTask(addTo, listDef, tasks) {
      tasks = _.isArray(tasks) ? tasks : [tasks];

      User.addTask({
        body: tasks.map(function (task) {
          return {
            text: task,
            type: listDef.type,
            tags: _.keys(User.user.filters),
          }
        }),
      });
    }

    $scope.addTask = function(addTo, listDef) {
      if (listDef.bulk) {
        var tasks = listDef.newTask.split(/[\n\r]+/);
        //Reverse the order of tasks so the tasks will appear in the order the user entered them
        tasks.reverse();
        addTask(addTo, listDef, tasks);
        listDef.bulk = false;
      } else {
        addTask(addTo, listDef, listDef.newTask);
      }
      delete listDef.newTask;
      delete listDef.focus;
      if (listDef.type=='daily') Guide.goto('intro', 2);
    };

    $scope.toggleBulk = function(list) {
      if (typeof list.bulk === 'undefined') {
        list.bulk = false;
      }
      list.bulk = !list.bulk;
      list.focus = true;
    };

    $scope.editTask = Tasks.editTask;

    $scope.canEdit = function(task) {
      // can't edit challenge tasks
      return !task.challenge.id;
    }

    $scope.doubleClickTask = function (obj, task) {
      if (obj._locked) {
        return false;
      }

      if (task._editing) {
        $scope.saveTask(task);
      } else {
        $scope.editTask(task, User.user);
      }
    }

    /**
     * Add the new task to the actions log
     */
    $scope.clearDoneTodos = function() {
      if (!confirm(window.env.t('sureDeleteCompletedTodos'))) {
        return;
      }
      Tasks.clearCompletedTodos();
      User.user.todos = _.reject(User.user.todos, 'completed');
    };

    /**
     * Pushes task to top or bottom of list
     */
    $scope.pushTask = function(task, index, location) {
      var to = (location === 'bottom' || $scope.ctrlPressed) ? -1 : 0;
      User.sortTask({params:{id: task._id, taskType: task.type}, query:{from:index, to:to}})
    };

    /**
     * This is calculated post-change, so task.completed=true if they just checked it
     */
    $scope.changeCheck = function(task) {
      if (task.completed) {
        $scope.score(task, "up");
      } else {
        $scope.score(task, "down");
      }
    };

    $scope.saveTask = function(task, stayOpen, isSaveAndClose) {
      if (task._edit) {
        angular.copy(task._edit, task);
      }
      task._edit = undefined;

      if (task.checklist) {
        task.checklist = _.filter(task.checklist, function (i) {
          return !!i.text
        });
      }

      User.updateTask(task, {body: task});
      if (!stayOpen) task._editing = false;

      if (isSaveAndClose) {
        $("#task-" + task._id).parent().children('.popover').removeClass('in');
      }

      if (task.type == 'habit') Guide.goto('intro', 3);
    };

    $scope.completeChecklistItem = function completeChecklistItem(task) {
      User.updateTask(task, {body: task});
    };

    /**
     * Reset $scope.task to $scope.originalTask
     */
    $scope.cancelTaskEdit = Tasks.cancelTaskEdit;

    $scope.removeTask = function(task) {
      if (!confirm(window.env.t('sureDelete', {taskType: window.env.t(task.type), taskText: task.text}))) return;
      task._edit = undefined;
      User.deleteTask({params:{id: task._id, taskType: task.type}})
    };

    $scope.unlink = function(task, keep) {
      if (keep.search('-all') !== -1) { // unlink all tasks
        Tasks.unlinkAllTasks(task.challenge.id, keep)
          .success(function () {
            User.sync({});
          });
      } else { // unlink a task
        Tasks.unlinkOneTask(task._id, keep)
          .success(function () {
            User.sync({});
          });
      }
    };

    /*
     ------------------------
     To-Dos
     ------------------------
     */
    $scope._today = moment().add({days: 1});

    $scope.loadedCompletedTodos = function () {
      if (Tasks.loadedCompletedTodos === true) {
        return;
      }

      User.user.todos = _.reject(User.user.todos, 'completed')

      Tasks.getUserTasks(true)
        .then(function (response) {
          User.user.todos = User.user.todos.concat(response.data.data);
          Tasks.loadedCompletedTodos = true;
        });
    }

    /*
     ------------------------
     Dailies
     ------------------------
     */

    $scope.openDatePicker = function($event, task) {
      $event.preventDefault();
      $event.stopPropagation();

      task._isDatePickerOpen = !task._isDatePickerOpen;
    }

    /*
     ------------------------
     Checklists
     ------------------------
     */
    function focusChecklist(task,index) {
      window.setTimeout(function(){
        $('#task-'+task._id+' .checklist-form input[type="text"]')[index].focus();
      });
    }

    $scope.addChecklist = function(task) {
      task._edit.checklist = [{completed:false, text:""}];
      focusChecklist(task._edit,0);
    }

    $scope.addChecklistItem = function(task, $event, $index) {
      if (task._edit.checklist[$index].text) {
        if ($index === task._edit.checklist.length - 1) {
          task._edit.checklist.push({ completed: false, text: '' });
        }
        focusChecklist(task._edit, $index + 1);
      } else {
        // TODO Provide UI feedback that this item is still blank
      }
    }

    $scope.removeChecklistItem = function(task, $event, $index, force) {
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

    $scope.swapChecklistItems = function(task, oldIndex, newIndex) {
      var toSwap = task._edit.checklist.splice(oldIndex, 1)[0];
      task._edit.checklist.splice(newIndex, 0, toSwap);
    }

    $scope.navigateChecklist = function(task,$index,$event){
      focusChecklist(task, $event.keyCode == '40' ? $index+1 : $index-1);
    }

    $scope.checklistCompletion = function(checklist){
      return _.reduce(checklist,function(m,i){return m+(i.completed ? 1 : 0);},0)
    }

    $scope.collapseChecklist = function(task) {
      task.collapseChecklist = !task.collapseChecklist;
      $scope.saveTask(task,true);
    }

    /*
     ------------------------
     Items
     ------------------------
     */

    $scope.$watch('user.items.gear.owned', function(){
      $scope.itemStore = Shared.updateStore(User.user);
    },true);

    $scope.healthPotion = Content.potion;
    $scope.armoire = Content.armoire;

    $scope.buy = function(item) {
      playRewardSound(item);
      User.buy({params:{key:item.key}});
    };

    $scope.buyArmoire = function () {
      playRewardSound($scope.armoire);
      User.buyArmoire();
    }

    /*
     ------------------------
     Hiding Tasks
     ------------------------
     */

    $scope.shouldShow = function(task, list, prefs){
      if (task._editing) // never hide a task while being edited
        return true;
      var shouldDo = task.type == 'daily' ? habitrpgShared.shouldDo(new Date, task, prefs) : true;
      switch (list.view) {
        case "yellowred":  // Habits
          return task.value < 1;
        case "greenblue":  // Habits
          return task.value >= 1;
        case "remaining":  // Dailies and To-Dos
          return !task.completed && shouldDo;
        case "complete":   // Dailies and To-Dos
          return task.completed || !shouldDo;
        case "dated":  // To-Dos
          return !task.completed && task.date;
        case "ingamerewards":   // All skills/rewards except the user's own
          return false; // Because "rewards" list includes only the user's own
        case "all":
          return true;
      }
    }

    function playRewardSound (task) {
      if (task.value <= User.user.stats.gp){
        $rootScope.playSound('Reward');
      }
    }

    var isCtrlPressed = function (keyEvent) {
      if (CTRL_KEYS.indexOf(keyEvent.keyCode) > -1) {
        $scope.ctrlPressed = true;
        $scope.$apply();
      }
    }

    var isCtrlLetGo = function (keyEvent) {
      if (CTRL_KEYS.indexOf(keyEvent.keyCode) > -1) {
        $scope.ctrlPressed = false;
        $scope.$apply();
      }
    }

    document.addEventListener('keydown', isCtrlPressed);
    document.addEventListener('keyup', isCtrlLetGo);

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
      if (toState.name.indexOf('tasks') < 0) {
        document.removeEventListener('keydown', isCtrlPressed);
        document.removeEventListener('keyup', isCtrlLetGo);
      }
    });

    /*
    ------------------------
    Tags
    ------------------------
    */

    $scope.updateTaskTags = function (tagId, task) {
      var tagIndex = task._edit.tags.indexOf(tagId);
      if (tagIndex === -1) {
        Tasks.addTagToTask(task._id, tagId);
        task.tags.push(tagId);
      } else {
        Tasks.removeTagFromTask(task._id, tagId);
        task.tags.splice(tagIndex, 1);
      }
      angular.copy(task.tags, task._edit.tags);
    }

    /*
     ------------------------
     Disabling Spells
     ------------------------
     */

    $scope.spellDisabled = function (skill) {
      if (skill === 'frost' && $scope.user.stats.buffs.streaks) {
        return true;
      } else if (skill === 'stealth' && $scope.user.stats.buffs.stealth >= $scope.user.dailys.length) {
        return true;
      }

      return false;
    };

    $scope.skillNotes = function (skill) {
      var notes = skill.notes();

      if (skill.key === 'frost' && $scope.spellDisabled(skill.key)) {
        notes = window.env.t('spellWizardFrostAlreadyCast');
      } else if (skill.key === 'stealth' && $scope.spellDisabled(skill.key)) {
        notes = window.env.t('spellRogueStealthMaxedOut');
      } else if (skill.key === 'stealth') {
        notes = window.env.t('spellRogueStealthDaliesAvoided', { originalText: notes, number: $scope.user.stats.buffs.stealth });
      }

      return notes;
    };
  }]);
