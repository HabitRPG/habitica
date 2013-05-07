'use strict'

save = (User, $scope, Helpers) ->
  $scope.newTask.id = Helpers.uuid()
  User.get()[$scope.newTask.type + 's'].unshift JSON.parse JSON.stringify $scope.newTask
  $scope.newTask.text = ''

angular.module('habitRPG')
  .controller 'HabitsCtrl', ($scope, User, Helpers) ->
                $scope.newTask =
                  {
                  type: 'habit'
                  value: 0
                  up: true
                  down: true
                  priority: "!!"
                  }
                $scope.placeHolder = 'New Habit'
                $scope.save = ->
                  save(User, $scope, Helpers)
  .controller 'DailysCtrl', ($scope, User, Helpers) ->
                $scope.newTask =
                  {
                  type: "daily"
                  value: 0
                  completed: false
                  repeat:
                    {
                    m: true
                    t: true
                    w: true
                    th: true
                    f: true
                    s: true
                    su: true
                    }
                  "priority": "!!"
                  }
                $scope.placeHolder = 'New Daily'
                $scope.save = ->
                  save(User, $scope, Helpers)
  .controller 'TodosCtrl', ($scope, User, Helpers) ->
                $scope.newTask =
                  {
                  type: "todo"
                  value: -3
                  completed: false
                  "priority": "!!"
                  }
                $scope.placeHolder = 'New Todo'
                $scope.clearCompleted = ->
                  User.get()['todos'] = User.get()['todos'].filter (i)->
                    !i.completed
                $scope.save = ->
                  save(User, $scope, Helpers)
  .controller 'RewardsCtrl', ($scope, User, Helpers) ->
                $scope.newTask =
                  {
                  type: "reward"
                  value: 10
                  }
                $scope.placeHolder = 'New Reward'
                $scope.save = ->
                  save(User, $scope, Helpers)

