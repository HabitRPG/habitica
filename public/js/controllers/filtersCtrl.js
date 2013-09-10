"use strict";

habitrpg.controller("FiltersCtrl", ['$scope', '$rootScope', 'User', 'API_URL', '$http',
  function($scope, $rootScope, User, API_URL, $http) {
    var user = User.user;
    $scope._editing = false;

    $scope.saveOrEdit = function(){
      if ($scope._editing) {
        User.log({op:'set',data:{'tags':user.tags}});
      }
      $scope._editing = !$scope._editing;
    }

    $scope.toggleFilter = function(tag) {
      user.filters[tag.id] = !user.filters[tag.id];
      // no longer persisting this, it was causing a lot of confusion - users thought they'd permanently lost tasks
      // Note: if we want to persist for just this computer, easy method is:
      // User.save();
    };

    $scope.createTag = function(name) {
      user.tags = user.tags || [];
      user.tags.push({
        id: window.habitrpgShared.helpers.uuid(),
        name: name
      });
      User.log({op:'set',data:{'tags':user.tags}});
      $scope._newTag = '';
    };


    $scope['delete'] = function(tag, $index){
      delete user.filters[tag.id];
      user.tags.splice($index,1);
      // remove tag from all tasks
      _.each(user.tasks, function(task) {
        delete user.tasks[task.id].tags[tag.id];
      });
      $http['delete'](API_URL + '/api/v1/user/tags/' + tag.id)
        .error(function(data){
          alert(data);
        })
    }

}]);
