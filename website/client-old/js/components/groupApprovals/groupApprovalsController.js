habitrpg.controller('GroupApprovalsCtrl', ['$scope', 'Tasks',
  function ($scope, Tasks) {
    $scope.approve = function (taskId, userId, username, $index) {
      if (!confirm(env.t('confirmTaskApproval', {username: username}))) return;
      Tasks.approve(taskId, userId)
        .then(function (response) {
          $scope.group.approvals.splice($index, 1);
        });
    };

    $scope.approvalTitle = function (approval) {
      return env.t('approvalTitle', {text: approval.text, userName: approval.userId.profile.name});
    };

    $scope.refreshApprovals = function () {
      $scope.loading = true;
      Tasks.getGroupApprovals($scope.group._id)
      .then(function (response) {
        if (response) $scope.group.approvals = response.data.data;
        $scope.loading = false;
      });
    };
  }]);
