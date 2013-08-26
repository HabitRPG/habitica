"use strict"
habitrpg.controller "TaskDetailsCtrl", ($scope, $rootScope, $location, User) ->

  $scope.save = (task) ->
    setVal = (k, v) ->
      if typeof v isnt "undefined"
        op = {op: "set", data: {}}
        op.data["tasks." + task.id + "." + k] = v
        log.push op
    log = []
    setVal "text", task.text
    setVal "notes", task.notes
    setVal "priority", task.priority
    if task.type is "habit"
      setVal "up", task.up
      setVal "down", task.down
    else if task.type is "daily"
      setVal "repeat", task.repeat
      setVal "streak", task.streak # TODO we'll remove this once rewrite's running for a while. This was a patch for derby issues
      # _.each(task.repeat, function(v, k) {
      #   setVal("repeat." + k, v);
      # })
    else if task.type is "todo"
      setVal "date", task.date
    else setVal "value", task.value  if task.type is "reward"
    User.log log
    task._editing = false

  $scope.cancel = ->
    # reset $scope.task to $scope.originalTask
    for key of $scope.task
      $scope.task[key] = $scope.originalTask[key]
    $scope.originalTask = null
    $scope.editedTask = null
    $scope.editing = false
