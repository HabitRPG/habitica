habitrpg.controller('GroupTaskActionsCtrl', ['$scope', 'Shared', 'Tasks', 'User',
  function ($scope, Shared, Tasks, User) {
    $scope.assignedMembers = [];
    $scope.user = User.user;

    $scope.task._edit.requiresApproval = false;
    if ($scope.task.group.approval.required) {
      $scope.task._edit.requiresApproval = $scope.task.group.approval.required;
    }

    $scope.$on('addedGroupMember', function(evt, userId) {
      Tasks.assignTask($scope.task.id, userId);
    });

    $scope.$on('removedGroupMember', function(evt, userId) {
      Tasks.unAssignTask($scope.task.id, userId);
    });
  }]);
