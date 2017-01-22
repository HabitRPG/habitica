habitrpg.controller('GroupTaskActionsCtrl', ['$scope', 'Shared', 'Tasks', 'User',
  function ($scope, Shared, Tasks, User) {
    $scope.assignedMembers = [];
    $scope.user = User.user;

    // We must use a separate field here, because task.group is private. So, instead, we send this tmp field to alter the approval.
    $scope.task._edit.requiresApproval = false;
    if ($scope.task.group.approval.required) {
      $scope.task._edit.requiresApproval = $scope.task.group.approval.required;
    }

    $scope.toggleTaskRequiresApproval = function () {
      $scope.task._edit.group.approval.required = !$scope.task._edit.group.approval.required;
      $scope.task._edit.requiresApproval = $scope.task._edit.group.approval.required;
    }

    $scope.$on('addedGroupMember', function(evt, userId) {
      $scope.task.group.assignedUsers.push(userId);
      if ($scope.task._edit) $scope.task._edit.group.assignedUsers.push(userId);
      Tasks.assignTask($scope.task.id, userId);
    });

    $scope.$on('removedGroupMember', function(evt, userId) {
      var index = $scope.task.group.assignedUsers.indexOf(userId);
      $scope.task.group.assignedUsers.splice(index, 1);
      if ($scope.task._edit) {
        var index = $scope.task._edit.group.assignedUsers.indexOf(userId);
        $scope.task._edit.group.assignedUsers.splice(index, 1);
      }
      Tasks.unAssignTask($scope.task.id, userId);
    });
  }]);
