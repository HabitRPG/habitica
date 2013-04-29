'use strict'
save = (User, $scope) ->
  User.get()[$scope.type + 's'].unshift
    text: $scope.newTask
    type: $scope.type
  $scope.newTask = ''

angular.module('habitRPG')

  .controller 'HabitsCtrl', ($scope, User) ->
                $scope.type = 'habit'
                $scope.placeHolder = 'New Habit'
                $scope.save = ->
                  save(User, $scope)


  .controller 'DailysCtrl', ($scope, User) ->
                $scope.type = 'daily'
                $scope.placeHolder = 'New Daily'
                $scope.save = ->
                  save(User, $scope)

  .controller 'TodosCtrl', ($scope, User) ->
                $scope.type = 'todo'
                $scope.placeHolder = 'New Todo'
                $scope.save = ->
                  save(User, $scope)

  .controller 'RewardsCtrl', ($scope, User) ->
                $scope.type = 'reward'
                $scope.placeHolder = 'New Reward'
                $scope.save = ->
                  save(User, $scope)

