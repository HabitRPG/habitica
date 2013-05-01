'use strict'
del = (User, $scope) ->
  User.get()[$scope.task.type + 's'].splice($scope.$index, 1)


controller = ($scope, User) ->
  $scope.del = ->
    del(User, $scope)

angular.module('habitRPG')
  .controller('HabitCtrl', controller)
  .controller('DailyCtrl', controller)
  .controller('TodoCtrl', controller)
  .controller('RewardCtrl', controller)

