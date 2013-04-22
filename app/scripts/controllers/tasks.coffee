'use strict'

save = (User, $scope) ->
    debugger
    User.get()[$scope.type + 's'].unshift
      text: $scope.newTask
      type: $scope.type
    $scope.newTask = ''

angular.module('habitRPG')

  .controller 'HabitsCtrl', ($scope, User) ->
    $scope.type = 'habit'
    $scope.newTask = ''
    $scope.placeHolder = 'New Habit'
    $scope.save = ->
      debugger
      save(User, $scope)

  .controller 'DailysCtrl', ($scope, User) ->
    $scope.type = 'daily'
    $scope.newTask = ''
    $scope.placeHolder = 'New Daily'
    $scope.save = -> save(User, $scope)

  .controller 'TodosCtrl', ($scope, User) ->
    $scope.type = 'todo'
    $scope.newTask = ''
    $scope.placeHolder = 'New Todo'
    $scope.save = -> save(User, $scope)

  .controller 'RewardsCtrl', ($scope, User) ->
    $scope.type = 'reward'
    $scope.newTask = ''
    $scope.placeHolder = 'New Reward'
    $scope.save = -> save(User, $scope)

