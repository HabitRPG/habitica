"use strict"
habitrpg.controller "TasksCtrl", ($scope, $rootScope, $location, filterFilter, User, Algos, Helpers, Notification) ->

  $scope.taskLists = [
    {header: 'Habits', type: 'habit', inputValue:'_newHabit', placeHolder: 'New Habit', list: User.user.habits, main:true, editable:true}
    {header: 'Dailies', type: 'daily', inputValue:'_newDaily', placeHolder: 'New Daily', list: User.user.dailys, main:true, editable:true}
    {header: 'Todos', type: 'todo', inputValue:'_newTodo', placeHolder: 'New Todo', list: User.user.todos, main:true, editable:true}
    {header: 'Reward', type: 'reward', inputValue:'_newReward', placeHolder: 'New Reward', list: User.user.rewards, main:true, editable:true}
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


  $scope.notDue = (task) ->
    if task.type is "daily"
      not window.habitrpgShared.helpers.shouldDo(moment(), task.repeat)
    else
      false

  $scope.getClass = (value) ->
    out = ""
    if value < -20
      out += " color-worst"
    else if value < -10
      out += " color-worse"
    else if value < -1
      out += " color-bad"
    else if value < 1
      out += " color-neutral"
    else if value < 5
      out += " color-good"
    else if value < 10
      out += " color-better"
    else
      out += " color-best"
    out

  $scope.addTask = ->
    return  unless $scope.newTask.length
    defaults =
      text: $scope.newTask
      type: $scope.taskType()
      value: (if $scope.taskType() is "reward" then 20 else 0)

    extra = {}
    switch $scope.taskType()
      when "habit"
        extra =
          up: true
          down: true
      when "daily", "todo"
        extra = completed: false
    newTask = _.defaults(extra, defaults)
    newTask.id = Helpers.uuid()
    User.user[newTask.type + "s"].unshift newTask
    $scope.showedTasks.unshift newTask
    User.log
      op: "addTask"
      data: newTask

    $scope.newTask = ""


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

    $(".taskWell").css "height", $(window).height() - 61

    # TODO this should be somewhere else, but fits the html location better here
    $rootScope.revive = ->
      window.habitrpgShared.algos.revive User.user
      User.log op: "revive"

    counter = 0

    ###
    ------------------------
    Items
    ------------------------
    ###
    $scope.$watch "user.items", ->
      $scope.itemStore = window.habitrpgShared.items.updateStore($scope.user)

    $scope.buy = (type) ->
      hasEnough = window.habitrpgShared.items.buyItem($scope.user, type)
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
