"use strict";

habitrpg.controller("TasksCtrl", ['$scope', '$rootScope', '$location', 'User','Notification', '$http', 'API_URL', '$timeout',
  function($scope, $rootScope, $location, User, Notification, $http, API_URL, $timeout) {
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
      if (!confirm("Are you sure you want to delete this task?")) return;
      User.user.ops.deleteTask({params:{id:list[$index].id}})
    };

    $scope.saveTask = function(task) {
      User.user.ops.updateTask({params:{id:task.id},body:task});
      task._editing = false;
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
    var ws = window.setTimeout;
    $scope.addChecklist = function(task) {
      task.checklist = [{completed:false,text:""}];
      ws(function(){
        $('#task-'+task.id+' .checklist-form .inline-edit')[0].focus();
      });
    }
    $scope.checkChecklistItem = function(task){
      User.user.ops.updateTask({params:{id:task.id},body:task});
    }
    $scope.saveChecklist = function(task,$event,$index) {
      User.user.ops.updateTask({params:{id:task.id},body:task});
      task.checklist = _.filter(task.checklist,function(i){return !!i.text});
      $event.target.blur();
      if ($index == task.checklist.length-1){
        task.checklist.push({completed:false,text:''});
        ws(function(){
          var list = $('#task-'+task.id+' .checklist-form .inline-edit');
          list[list.length-1].focus();
        },100);
      }
    }
    $scope.removeChecklistItem = function(task,$index){
      task.checklist.splice($index,1);
      User.user.ops.updateTask({params:{id:task.id},body:task});
    }
    $scope.checklistCompletion = function(checklist){
      return _.reduce(checklist,function(m,i){return m+(i.completed ? 1 : 0);},0)
    }

    /*
     ------------------------
     Items 
     ------------------------
     */

    $scope.$watch('user.items.gear.equipped', function(){
      $scope.itemStore = $rootScope.Shared.updateStore(User.user);
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
