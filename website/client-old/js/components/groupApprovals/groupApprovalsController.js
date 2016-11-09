habitrpg.controller('GroupApprovalsCtrl', ['$scope', 'Tasks',
  function ($scope, Tasks) {
    $scope.approvals = [];

    Tasks.getGroupApprovals($scope.group._id)
      .then(function (response) {
        $scope.approvals = response.data.data;
      });

    $scope.approve = function (taskId, userId, $index) {
      if (!confirm(env.t('confirmTaskApproval'))) return;
      Tasks.approve(taskId, userId)
        .then(function (response) {
          $scope.approvals.splice($index, 1);
        });
    };

  }]);
