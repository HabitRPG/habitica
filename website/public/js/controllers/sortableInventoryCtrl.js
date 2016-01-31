habitrpg.controller('SortableInventoryController', ['$scope',
  function ($scope) {

    // doing this in a function causes 10 $digest iteration error
    attributeSort = {
      con: ['-con', '-(con+int+per+str)'],
      int: ['-int', '-(con+int+per+str)'],
      per: ['-per', '-(con+int+per+str)'],
      str: ['-str', '-(con+int+per+str)'],
      name: 'text()',
      set: 'set'
    }

    $scope.setOrder = function(order) {
      if (order in attributeSort) {
        $scope.order = attributeSort[order];
      }
    };
}]);
