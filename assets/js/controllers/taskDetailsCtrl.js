"use strict";

habitrpg.controller("TaskDetailsCtrl", function($scope, $rootScope, $location, User) {
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
    if (task.type === "habit") {
      setVal("up", task.up);
      setVal("down", task.down);
    } else if (task.type === "daily") {
      setVal("repeat", task.repeat);
      /* TODO we'll remove this once rewrite's running for a while. This was a patch for derby issues
       */

      setVal("streak", task.streak);
      /* _.each(task.repeat, function(v, k) {
       setVal("repeat." + k, v);
       })
       */

    } else if (task.type === "todo") {
      setVal("date", task.date);
    } else {
      if (task.type === "reward") {
        setVal("value", task.value);
      }
    }
    User.log(log);
    return task._editing = false;
  };
  return $scope.cancel = function() {
    /* reset $scope.task to $scope.originalTask
     */

    var key;
    for (key in $scope.task) {
      $scope.task[key] = $scope.originalTask[key];
    }
    $scope.originalTask = null;
    $scope.editedTask = null;
    return $scope.editing = false;
  };
});
