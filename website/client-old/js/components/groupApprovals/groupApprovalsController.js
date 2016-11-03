habitrpg.controller('GroupApprovalsCtrl', ['$scope', 'Tasks',
  function ($scope, Tasks) {
    $scope.approvals = [];

    Tasks.getGroupApprovals($scope.group._id)
      .then(function (response) {
        $scope.approvals = response.data.data;
      });

  }]);
