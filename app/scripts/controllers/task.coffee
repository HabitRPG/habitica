'use strict'
del = (User, $scope) ->

  User.get()[$scope.task.type + 's'].forEach(
                                         (task, index, array) ->
                                            if task.id == $scope.task.id
                                              array.splice(index, 1)
                                       )


angular.module('habitRPG')
  .controller 'HabitCtrl', ($scope, User) ->
                $scope.del = ->
                  del(User, $scope)
  .controller 'DailyCtrl', ($scope, User) ->
                $scope.del = ->
                  del(User, $scope)
  .controller 'TodoCtrl', ($scope, User) ->
                $scope.del = ->
                  del(User, $scope)
  .controller 'RewardCtrl', ($scope, User) ->
                $scope.del = ->
                  del(User, $scope)

