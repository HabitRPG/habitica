"use strict";

habitrpg.controller("TasksCtrl", ['$scope', '$rootScope', '$location', 'User','Notification', '$http', 'ApiUrl', '$timeout', 'Content', 'Shared', 'Guide', 'Tasks', 'Analytics',
  function($scope, $rootScope, $location, User, Notification, $http, ApiUrl, $timeout, Content, Shared, Guide, Tasks, Analytics) {
    $scope.obj = User.user; // used for task-lists
    $scope.user = User.user;

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
      User.score({params:{id: task.id, direction:direction}});
      Analytics.updateUser();
      Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'score task','taskType':task.type,'direction':direction});
    };

    function addTask(addTo, listDef, task) {
      var newTask = {
        text: task,
        type: listDef.type,
        tags: _.transform(User.user.filters, function(m, v, k) {
         if (v) m.push(v);
        }),
      };

      User.addTask({body:newTask});
    }

    $scope.addTask = function(addTo, listDef) {
      if (listDef.bulk) {
        var tasks = listDef.newTask.split(/[\n\r]+/);
        //Reverse the order of tasks so the tasks will appear in the order the user entered them
        tasks.reverse();
        _.each(tasks, function(t) {
          addTask(addTo, listDef, t);
        });
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

    /**
     * Add the new task to the actions log
     */
    $scope.clearDoneTodos = function() {
      Tasks.clearCompletedTodos();
    };

    /**
     * Pushes task to top or bottom of list
     */
    $scope.pushTask = function(task, index, location) {
      var to = (location === 'bottom' || $scope.ctrlPressed) ? -1 : 0;
      User.sortTask({params:{id:task.id},query:{from:index, to:to}})
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

    $scope.removeTask = function(task) {
      if (!confirm(window.env.t('sureDelete', {taskType: window.env.t(task.type), taskText: task.text}))) return;
      User.deleteTask({params:{id:task.id}})
    };

    $scope.saveTask = function(task, stayOpen, isSaveAndClose) {
      if (task.checklist)
        task.checklist = _.filter(task.checklist,function(i){return !!i.text});
      User.updateTask({params:{id:task.id},body:task});
      if (!stayOpen) task._editing = false;

      if (isSaveAndClose) {
        $("#task-" + task.id).parent().children('.popover').removeClass('in');
      }

      if (task.type == 'habit') Guide.goto('intro', 3);
    };

    /**
     * Reset $scope.task to $scope.originalTask
     */
    $scope.cancel = function() {
      var key;
      for (key in $scope.task) {
        $scope.task[key] = $scope.originalTask[key];
      }
      $scope.originalTask = null;
      $scope.editedTask = null;
      $scope.editing = false;
    };

    $scope.unlink = function(task, keep) {
      Tasks.unlinkTask(task.id, keep)
        .success(function () {
          User.log({});
        });
    };

    /*
     ------------------------
     To-Dos
     ------------------------
     */
    $scope._today = moment().add({days: 1});

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
        $('#task-'+task.id+' .checklist-form input[type="text"]')[index].focus();
      });
    }

    $scope.addChecklist = function(task) {
      task.checklist = [{completed:false, text:""}];
      focusChecklist(task,0);
    }

    $scope.addChecklistItem = function(task, $event, $index) {
      if (!task.checklist[$index].text) {
        // Don't allow creation of an empty checklist item
        // TODO Provide UI feedback that this item is still blank
      } else if ($index == task.checklist.length-1){
        User.updateTask({params:{id:task.id},body:task}); // don't preen the new empty item
        task.checklist.push({completed:false,text:''});
        focusChecklist(task,task.checklist.length-1);
      } else {
        $scope.saveTask(task, true);
        focusChecklist(task, $index + 1);
      }
    }

    $scope.removeChecklistItem = function(task, $event, $index, force){
      // Remove item if clicked on trash icon
      if (force) {
        Tasks.removeChecklistItem(task.id, task.checklist[$index]._id);
        task.checklist.splice($index, 1);
      } else if (!task.checklist[$index].text) {
        // User deleted all the text and is now wishing to delete the item
        // saveTask will prune the empty item
        Tasks.removeChecklistItem(task.id, task.checklist[$index]._id);
        // Move focus if the list is still non-empty
        if ($index > 0)
          focusChecklist(task, $index-1);
        // Don't allow the backspace key to navigate back now that the field is gone
        $event.preventDefault();
      }
    }

    $scope.swapChecklistItems = function(task, oldIndex, newIndex) {
      var toSwap = task.checklist.splice(oldIndex, 1)[0];
      task.checklist.splice(newIndex, 0, toSwap);
      $scope.saveTask(task, true);
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
  }]);
