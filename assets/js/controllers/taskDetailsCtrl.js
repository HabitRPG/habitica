'use strict';

habitrpg.controller('TaskDetailsCtrl',
  ['$scope', '$rootScope', '$location', 'User',
  function($scope, $rootScope, $location, User) {

    $scope.task = $rootScope.selectedTask;
    $scope.editing = false;
    $scope.editedTask = null;

    $scope.goBack = function () {
        $rootScope.selectedTask = null;
        $location.path('/' + $scope.task.type);
    };

    $scope.edit = function () {
        $scope.originalTask = _.clone($scope.task); // TODO deep clone?;
        $scope.editedTask = $scope.task;
        $scope.editing = true;
    };

    $scope.save = function () {
        var task = $scope.task,
            log = [];

        function setVal(k,v){
          if (typeof v !== "undefined") {
            var op = {op: 'set', data:{}};
            op.data["tasks." + task.id + "." + k] = v;
            log.push(op);
          }
        }

        setVal("text", task.text);
        setVal("notes", task.notes);
        setVal("priority", task.priority);
        if (task.type == 'habit') {
          setVal("up", task.up);
          setVal("down", task.down);
        } else if (task.type == 'daily') {
          setVal("repeat", task.repeat);
//          _.each(task.repeat, function(v, k) {
//              setVal("repeat." + k, v);
//          })
        } else if (task.type == 'todo') {
          setVal("date", task.date);
        } else if (task.type == 'reward') {
          setVal("value", task.value);
        }


        User.log(log);
        $rootScope.selectedTask = null;
        $location.path('/' + $scope.task.type);
        $scope.editing = false;
    };

    $scope.cancel = function () {
        // reset $scope.task to $scope.originalTask
        for (var key in $scope.task) {
            $scope.task[key] = $scope.originalTask[key];
        }
        $scope.originalTask = null;
        $scope.editedTask = null;
        $scope.editing = false;
    };

    $scope.delete = function () {
      var confirmed = window.confirm("Delete this task?");
      if (confirmed !== true) return;
      var task = $scope.task;
      var tasks = User.user[task.type+'s'];
      User.log({op: 'delTask', data: task});
      $scope.goBack();
      delete tasks.splice(tasks.indexOf(task),1);
    };
  }
]);
