habitrpg.controller('SortableInventoryController', ['$scope',
  function ($scope) {
    var attributeSort = {
      constitution: ['-con', '-(con+int+per+str)'],
      intelligence: ['-int', '-(con+int+per+str)'],
      perception: ['-per', '-(con+int+per+str)'],
      strength: ['-str', '-(con+int+per+str)'],
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
