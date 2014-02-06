"use strict";

habitrpg.controller("TasksCtrl", ['$scope', '$location', 'User','Notification', '$http', 'API_URL', '$timeout', 'Shared',
  function($scope, $location, User, Notification, $http, API_URL, $timeout, Shared) {
    $scope.obj = User.user; // used for task-lists
    $scope.user = User.user;

    $scope.score = function(task, direction) {
      User.user.ops.score({params:{id: task.id, direction:direction}})
    };

    $scope.addTask = function(addTo, listDef) {
      var newTask = {
        text: listDef.newTask,
        type: listDef.type,
        tags: _.transform(User.user.filters, function(m,v,k){
          if (v) m[k]=v;
        })
      }
      User.user.ops.addTask({body:newTask});
      delete listDef.newTask;
    };

    /**
     * Add the new task to the actions log
     */
    $scope.clearDoneTodos = function() {};

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

    $scope.saveTask = function(task, stayOpen) {
      if (task.checklist)
        task.checklist = _.filter(task.checklist,function(i){return !!i.text});
      User.user.ops.updateTask({params:{id:task.id},body:task});
      if (!stayOpen) task._editing = false;
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
      $http.post(API_URL + '/api/v2/user/tasks/' + task.id + '/unlink?keep=' + keep)
        .success(function(){
          User.log({});
        });
    };

    /*
     ------------------------
     To-Dos
     ------------------------
     */
    $scope._today = moment().add('days',1);

    /*
     ------------------------
     Checklists
     ------------------------
     */
    function focusChecklist(task,index) {
      window.setTimeout(function(){
        $('#task-'+task.id+' .checklist-form .inline-edit')[index].focus();
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

  }]);
