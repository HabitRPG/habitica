habitrpg.controller('GroupApprovalsCtrl', ['$scope', 'Tasks',
  function ($scope, Tasks) {
    $scope.approve = function (taskId, userId, $index) {
      if (!confirm(env.t('confirmTaskApproval'))) return;
      Tasks.approve(taskId, userId)
        .then(function (response) {
          $scope.group.approvals.splice($index, 1);
        });
    };

    $scope.approvalTitle = function (approval) {
      return env.t('approvalTitle', {text: approval.text, userName: approval.userId.profile.name});
    };
  }]);
