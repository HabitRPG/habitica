habitrpg.controller('GroupTaskActionsCtrl', ['$scope', 'Shared', 'Tasks',
  function ($scope, Shared, Tasks) {
    //This is a dependency from the route. There is probably a better way to inject this through the directive
    $scope.group = $scope.obj;

    $scope.assignedMembers = [];


  }]);
