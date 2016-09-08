habitrpg.controller('GroupTaskActionsCtrl', ['$scope', 'Shared', 'Tasks',
  function ($scope, Shared, Tasks) {
    //This is a dependency from the route. There is probably a better way to inject this through the directive
    $scope.group = $scope.obj;

    $scope.tags = [
      { text: 'just' },
      { text: 'some' },
      { text: 'cool' },
      { text: 'tags' }
    ];

    $scope.loadTags = function(query) {
      // _.pluck(stooges, 'name');
      console.log($scope.group.members);
        return [ { text: 'Tag1' }, { text: 'Tag2' } , { text: 'Tag3' }];// $scope.group.members;
    };
  }]);
