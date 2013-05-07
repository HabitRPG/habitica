'use strict'

# Sorry for that. Will to be moved to some .helpers
generateUUID = ->
  d = new Date().getTime()
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) ->
    r = (d + Math.random()*16)%16 | 0
    d = Math.floor(d/16)
    if c=='x'
      return r
    else
      return (r&0x7|0x8)).toString(16)

save = (User, $scope) ->
  $scope.newTask.id = generateUUID()
  User.get()[$scope.newTask.type + 's'].unshift JSON.parse JSON.stringify $scope.newTask
  $scope.newTask.text = ''

angular.module('habitRPG')
  .controller 'HabitsCtrl', ($scope, User) ->
                $scope.newTask = {
                  type:'habit'
                  value:0
                  up:true
                  down:true
                  priority:"!!"
                }
                $scope.placeHolder = 'New Habit'
                $scope.save = ->
                  save(User, $scope)
  .controller 'DailysCtrl', ($scope, User) ->
                $scope.newTask = {
                type:"daily"
                value:0
                completed:false
                repeat:{
                  m:true
                  t:true
                  w:true
                  th:true
                  f:true
                  s:true
                  su:true
                }
                "priority":"!!"
                }
                $scope.placeHolder = 'New Daily'
                $scope.save = ->
                  save(User, $scope)
  .controller 'TodosCtrl', ($scope, User) ->
                $scope.newTask = {
                  type:"todo"
                  value:-3
                  completed:false
                  "priority":"!!"
                }
                $scope.placeHolder = 'New Todo'
                $scope.clearCompleted = ->
                  User.get()['todos'] = User.get()['todos'].filter (i)->
                    !i.completed
                $scope.save = ->
                  save(User, $scope)
  .controller 'RewardsCtrl', ($scope, User) ->
                $scope.newTask = {
                  type:"reward"
                  value:10
                }
                $scope.placeHolder = 'New Reward'
                $scope.save = ->
                  save(User, $scope)

