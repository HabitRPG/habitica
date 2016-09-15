'use strict';

habitrpg.controller("CopyMessageModalCtrl", ['$scope', 'User', 'Notification',
    function($scope, User, Notification){
      $scope.saveTodo = function() {
        var newTask = {
          text: $scope.text,
          type: 'todo',
          notes: $scope.notes
        };

        User.addTask({body:newTask});
        Notification.text(window.env.t('messageAddedAsToDo'));

        $scope.$close();
      }
  }]);
