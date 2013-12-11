"use strict";

habitrpg.controller("TasksCtrl", ['$scope', '$rootScope', '$location', 'User','Notification', '$http', 'API_URL',
  function($scope, $rootScope, $location, User, Notification, $http, API_URL) {
    $scope.obj = User.user; // used for task-lists

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
    /* TODO this should be somewhere else, but fits the html location better here
     */

    $scope.removeTask = function(list, $index) {
      if (!confirm("Are you sure you want to delete this task?")) return;
      User.user.ops.deleteTask({params:{id:list[$index].id}})
      list.splice($index, 1);
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
      $http.post(API_URL + '/api/v1/user/task/' + task.id + '/unlink?keep=' + keep)
        .success(function(){
          User.log({});
        });
    };

    /*
     ------------------------
     Items
     ------------------------
     */

    $rootScope.$on('userSynced', function(){
      $scope.itemStore = User.user.fns.updateStore();
    })

    $scope.buy = function(item) {
      var hasEnough = User.user.ops.buy({query:{key:item.key}});
      if (hasEnough) {
        Notification.text("Item purchased.");
        $scope.itemStore = User.user.fns.updateStore();
      } else {
//        Notification.text("Not enough Gold!");
        // handled by userServices interceptor
      }
    };

    $scope.clearCompleted = function() {
      User.user.todos = _.reject(User.user.todos, {completed:true});
      User.log({op: 'clear-completed'});
    }


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
