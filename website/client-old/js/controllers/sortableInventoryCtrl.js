habitrpg.controller('SortableInventoryController', ['$scope',
  function ($scope) {
    var attributeSort = {
      constitution: ['-(_effectiveCon)', '-(_effectiveCon+_effectiveInt+_effectivePer+_effectiveStr)'],
      intelligence: ['-(_effectiveInt)', '-(_effectiveCon+_effectiveInt+_effectivePer+_effectiveStr)'],
      perception: ['-(_effectivePer)', '-(_effectiveCon+_effectiveInt+_effectivePer+_effectiveStr)'],
      strength: ['-(_effectiveStr)', '-(_effectiveCon+_effectiveInt+_effectivePer+_effectiveStr)'],
      set: 'set'
    }

    $scope.setOrder = function (order) {
      $scope.orderChoice = order;
      if (order in attributeSort) {
        $scope.order = attributeSort[order];
      }
    };

    $scope.setGrouping = function (grouping) {
      $scope.groupingChoice = grouping;
    };

    $scope.orderChoice = 'set';
    $scope.setOrder($scope.orderChoice);
}]);
