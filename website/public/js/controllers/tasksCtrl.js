"use strict";

habitrpg.controller("TasksCtrl", ['$scope', '$rootScope', '$location', 'User','Notification', '$http', 'ApiUrl', '$timeout', 'Shared',
  function($scope, $rootScope, $location, User, Notification, $http, ApiUrl, $timeout, Shared) {
    $scope.obj = User.user; // used for task-lists
    $scope.user = User.user;

    $scope.score = function(task, direction) {
      switch (task.type) {
          case 'reward':
              $rootScope.playSound('Reward');
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
      User.user.ops.score({params:{id: task.id, direction:direction}})
    };

    $scope.parseTask = function(listDef, task) {
      var checkRegex = function(match, k) {
        var key = k || 1;
        if (match && match.length > key && typeof match[key] !== 'undefined') {
          return match[key];
        }
        return;
      };

      var regexes = {
        notes: /(?:\s+--"([^"]+)")/,
        due: /(?:\s+\^(\d?\d\/\d?\d\/\d?\d?\d\d))/,
        diff: /(?:\s+\!(easy|medium|hard))/,
        tag: /(?:\s+\#([^"\s]+|"[^"]+"))/g,
        value: /(?:\s+(\d+(?:\.\d{1,2})?|0?\.\d{1,2})?GP)/,
        up: /(?:\s+(\+))/,
        down: /(?:\s+(\-))/,
        days: /(?:\s+\^((?:m|t|w|r|f|s|u)+))/
      };

      var notes = task.match(regexes.notes);
      task = task.replace(regexes.notes, '');
      var due = task.match(regexes.due);
      task = task.replace(regexes.due, '');
      var diff = task.match(regexes.diff);
      task = task.replace(regexes.diff, '');
      var tags = task.match(regexes.tag);
      task = task.replace(regexes.tag, '');
      var value = task.match(regexes.value);
      task = task.replace(regexes.value, '');
      var up = task.match(regexes.up);
      task = task.replace(regexes.up, '');
      var down = task.match(regexes.down);
      task = task.replace(regexes.down, '');
      var days = task.match(regexes.days);
      task = task.replace(regexes.days, '');

      var newTask = {
        text: task,
        type: listDef.type
      };
      newTask.notes = checkRegex(notes) || '';
      if (listDef.type === 'habit') {
        newTask.up = (checkRegex(up)) ? 1 : 0;
        newTask.down = (checkRegex(down)) ? 1 : 0;
        if (newTask.up === 0 && newTask.down === 0) {
          newTask.up = 1;
          newTask.down = 1;
        }
      }
      if (listDef.type === 'daily') {
        newTask.repeat = (function(days){
          if (typeof days === 'undefined') {
            return {su:1,m:1,t:1,w:1,th:1,f:1,s:1};
          }
          var repeat = {su:0,m:0,t:0,w:0,th:0,f:0,s:0};
          repeat.su = (days.indexOf('u') > -1) ? 1 : 0;
          repeat.m = (days.indexOf('m') > -1) ? 1 : 0;
          repeat.t = (days.indexOf('t') > -1) ? 1 : 0;
          repeat.w = (days.indexOf('w') > -1) ? 1 : 0;
          repeat.th = (days.indexOf('r') > -1) ? 1 : 0;
          repeat.f = (days.indexOf('f') > -1) ? 1 : 0;
          repeat.s = (days.indexOf('s') > -1) ? 1 : 0;
          return repeat;
        })(checkRegex(days));
      }
      if (listDef.type === 'todo') {
        newTask.date = checkRegex(due);
      }
      if (listDef.type === 'reward') {
        newTask.value = parseInt(checkRegex(value)) || 10;
      } else {
        switch (checkRegex(diff)) {
          case 'hard':
            newTask.priority = 2;
            break;
          case 'medium':
            newTask.priority = 1.5;
            break;
          case 'easy':
          default:
            newTask.priority = 1;
            break;
        }
      }
      if (!tags || tags.length === 0) {
        newTask.tags = _.transform(User.user.filters, function(m,v,k){
          if (v) m[k]=v;
        });
      } else {
        tags = _.transform(tags, function(m,v){
          m.push(v.replace(/\s+\#/, ''));
        });
        newTask.tags = {};
        for (var i = 0; i < User.user.tags.length; i++) {
          if (tags.indexOf(User.user.tags[i].name) > -1) {
            newTask.tags[User.user.tags[i].id] = true;
          }
        }
      }
      return newTask;
    };

    $scope.addTask = function(addTo, listDef) {
      if (listDef.bulk) {
        var tasks = listDef.newTask.split(/[\n\r]+/);
        _.each(tasks, function(t) {
          var newTask = $scope.parseTask(listDef, t);
          User.user.ops.addTask({body:newTask});
        });
        listDef.bulk = false;
      } else {
        var newTask = $scope.parseTask(listDef, listDef.newTask);
        User.user.ops.addTask({body:newTask});
      }
      delete listDef.newTask;
      delete listDef.focus;
    };

    $scope.toggleBulk = function(list) {
      if (typeof list.bulk === 'undefined') {
        list.bulk = false;
      }
      list.bulk = !list.bulk;
      list.focus = true;
    };

    /**
     * Add the new task to the actions log
     */
    $scope.clearDoneTodos = function() {};

    /**
     * Pushes task to top or bottom of list
     */
    $scope.pushTask = function(task, index, location) {
      var to = (location === 'bottom') ? -1 : 0;
      User.user.ops.sortTask({params:{id:task.id},query:{from:index, to:to}})
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

    $scope.removeTask = function(list, $index) {
      if (!confirm(window.env.t('sureDelete'))) return;
      User.user.ops.deleteTask({params:{id:list[$index].id}})
    };

    $scope.saveTask = function(task, stayOpen, isSaveAndClose) {
      if (task.checklist)
        task.checklist = _.filter(task.checklist,function(i){return !!i.text});
      User.user.ops.updateTask({params:{id:task.id},body:task});
      if (!stayOpen) task._editing = false;
      if (isSaveAndClose)
        $("#task-" + task.id).parent().children('.popover').removeClass('in');
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
      // TODO move this to userServices, turn userSerivces.user into ng-resource
      $http.post(ApiUrl.get() + '/api/v2/user/tasks/' + task.id + '/unlink?keep=' + keep)
        .success(function(){
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
     Checklists
     ------------------------
     */
    function focusChecklist(task,index) {
      window.setTimeout(function(){
        $('#task-'+task.id+' .checklist-form input[type="text"]')[index].focus();
      });
    }
    $scope.addChecklist = function(task) {
      task.checklist = [{completed:false,text:""}];
      focusChecklist(task,0);
    }
    $scope.addChecklistItem = function(task,$event,$index) {
      if (!task.checklist[$index].text) {
        // Don't allow creation of an empty checklist item
        // TODO Provide UI feedback that this item is still blank
      } else if ($index == task.checklist.length-1){
        User.user.ops.updateTask({params:{id:task.id},body:task}); // don't preen the new empty item
        task.checklist.push({completed:false,text:''});
        focusChecklist(task,task.checklist.length-1);
      } else {
        $scope.saveTask(task,true);
        focusChecklist(task,$index+1);
      }
    }
    $scope.removeChecklistItem = function(task,$event,$index,force){
      // Remove item if clicked on trash icon
      if (force) {
        task.checklist.splice($index,1);
        $scope.saveTask(task,true);
      } else if (!task.checklist[$index].text) {
        // User deleted all the text and is now wishing to delete the item
        // saveTask will prune the empty item
        $scope.saveTask(task,true);
        // Move focus if the list is still non-empty
        if ($index > 0)
          focusChecklist(task,$index-1);
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

    $scope.$watch('user.items.gear.equipped', function(){
      $scope.itemStore = Shared.updateStore(User.user);
    },true);

    $scope.buy = function(item) {
      User.user.ops.buy({params:{key:item.key}});
      $rootScope.playSound('Reward');
    };


    /*
     ------------------------
     Ads
     ------------------------
     */

    /**
     * See conversation on http://productforums.google.com/forum/#!topic/adsense/WYkC_VzKwbA,
     * Adsense is very sensitive. It must be called once-and-only-once for every <ins>, else things break.
     * Additionally, angular won't run javascript embedded into a script template, so we can't copy/paste
     * the html provided by adsense - we need to run this function post-link
     */
    $scope.initAds = function(){
      $.getScript('//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    /*
     ------------------------
     Hiding Tasks
     ------------------------
     */

    $scope.shouldShow = function(task, list, prefs){
      if (task._editing) // never hide a task while being edited
        return true;
      var shouldDo = task.type == 'daily' ? habitrpgShared.shouldDo(new Date, task.repeat, prefs) : true;
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
  }]);
