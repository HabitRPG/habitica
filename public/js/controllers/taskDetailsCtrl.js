"use strict";

habitrpg.controller("TaskDetailsCtrl", ['$scope', '$rootScope', '$location', 'User',
  function($scope, $rootScope, $location, User) {
  $scope.save = function(task) {
    var log, setVal;
    setVal = function(k, v) {
      var op;
      if (typeof v !== "undefined") {
        op = {
          op: "set",
          data: {}
        };
        op.data["tasks." + task.id + "." + k] = v;
        return log.push(op);
      }
    };
    log = [];
    setVal("text", task.text);
    setVal("notes", task.notes);
    setVal("priority", task.priority);
    setVal("tags", task.tags);
    if (task.type === "habit") {
      setVal("up", task.up);
      setVal("down", task.down);
    } else if (task.type === "daily") {
      setVal("repeat", task.repeat);
      // TODO we'll remove this once rewrite's running for a while. This was a patch for derby issues
      setVal("streak", task.streak);

    } else if (task.type === "todo") {
      setVal("date", task.date);
    } else {
      if (task.type === "reward") {
        setVal("value", task.value);
      }
    }
    User.log(log);
    task._editing = false;
  };
  $scope.cancel = function() {
    /* reset $scope.task to $scope.originalTask
     */

    var key;
    for (key in $scope.task) {
      $scope.task[key] = $scope.originalTask[key];
    }
    $scope.originalTask = null;
    $scope.editedTask = null;
    $scope.editing = false;
  };

  $scope.open = function() {
      $timeout(function() {
          $scope.opened = true;
      });
  };
}]);
