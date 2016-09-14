habitrpg.controller('GroupTaskMetaActionsCtrl', ['$scope', 'Shared', 'Tasks', 'User',
  function ($scope, Shared, Tasks, User) {
    $scope.assignedMembers = [];
    $scope.user = User.user;

    $scope.claim = function () {
      Tasks.assignTask($scope.task.id, $scope.user._id);
      $scope.task.group.assignedUsers.push($scope.user._id);
    };

    $scope.userIsAssigned = function () {
      return $scope.task.group.assignedUsers.indexOf($scope.user._id) !== -1;
    };
  }]);
