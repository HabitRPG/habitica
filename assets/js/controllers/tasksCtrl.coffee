"use strict"
habitrpg.controller "TasksCtrl", ($scope, $rootScope, $location, User, Algos, Helpers, Notification) ->

  #FIXME
  $scope.taskLists = [
    {header: 'Habits', type: 'habit', placeHolder: 'New Habit', main:true, editable:true}
    {header: 'Dailies', type: 'daily', placeHolder: 'New Daily', main:true, editable:true}
    {header: 'Todos', type: 'todo', placeHolder: 'New Todo', main:true, editable:true}
    {header: 'Reward', type: 'reward', placeHolder: 'New Reward', main:true, editable:true}
  ]

  $scope.score = (task, direction) ->

    #save current stats to compute the difference after scoring.
    statsDiff = {}
    oldStats = _.clone(User.user.stats)
    Algos.score User.user, task, direction

    #compute the stats change.
    _.each oldStats, (value, key) ->
      newValue = User.user.stats[key]
      statsDiff[key] = newValue - value  if newValue isnt value

    #notify user if there are changes in stats.
    if Object.keys(statsDiff).length > 0
      Notification.push
        type: "stats"
        stats: statsDiff

    if task.type is "reward" and _.isEmpty(statsDiff)
      Notification.push
        type: "text"
        text: "Not enough GP."

    User.log
      op: "score"
      data: task
      dir: direction

  $scope.saveTask = (task) ->
    sets = {}
    sets["user."]
    User.log [
      op: 'set', {}
    ]

  $scope.addTask = (text) ->
    newTask = window.habitrpgShared.helpers.taskDefaults({text})
    User.user[newTask.type + "s"].unshift newTask
    # $scope.showedTasks.unshift newTask # FIXME what's thiss?
    User.log
      op: "addTask"
      data: newTask
    delete $scope.list.newTask

  #Add the new task to the actions log
  $scope.clearDoneTodos = ->

  #We can't alter $scope.user.tasks here. We have to invoke API call.
  #To be implemented
  $scope.selectTask = (task) ->
    $rootScope.selectedTask = task
    $location.path "/tasks/" + task.id

  $scope.changeCheck = (task) ->
    # This is calculated post-change, so task.completed=true if they just checked it
    if task.completed
      $scope.score task, "up"
    else
      $scope.score task, "down"

  # TODO this should be somewhere else, but fits the html location better here
  $rootScope.revive = ->
    window.habitrpgShared.algos.revive User.user
    User.log op: "revive"

  counter = 0


  $scope.remove = (task) ->
    return unless confirm("Are you sure you want to delete this task?") is true
    tasks = User.user[task.type + "s"]
    User.log {op: "delTask", data: task}
    tasks.splice(tasks.indexOf(task), 1)

  ###
  ------------------------
  Items
  ------------------------
  ###
  $scope.$watch "user.items", ->
    updated = window.habitrpgShared.items.updateStore(User.user)
    # Figure out whether we wanna put this in habitrpg-shared
    sorted = [
      updated.weapon
      updated.armor
      updated.head
      updated.shield
      updated.potion
      updated.reroll
    ]
    $scope.itemStore = sorted

  $scope.buy = (type) ->
    hasEnough = window.habitrpgShared.items.buyItem(User.user, type)
    if hasEnough
      User.log
        op: "buy"
        type: type

      Notification.push
        type: "text"
        text: "Item bought!"

    else
      Notification.push
        type: "text"
        text: "Not enough GP."
