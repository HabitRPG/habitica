"use strict";

habitrpg.controller("FiltersCtrl", ['$scope', '$rootScope', 'User', 'Shared',
  function($scope, $rootScope, User, Shared) {
    var user = User.user;
    $scope._editing = false;
    $scope._newTag = {name:''};
    $scope.filterQuery = '';

    var tagsSnap; // used to compare which tags need updating

    $scope.saveOrEdit = function(){
      if ($scope._editing) {
        _.each(User.user.tags, function(tag){
          // Send an update op for each changed tag (excluding new tags & deleted tags, this if() packs a punch)
          if (tagsSnap[tag.id] && tagsSnap[tag.id].name != tag.name)
            User.updateTag({params:{id:tag.id}, body:{name:tag.name}});
        })
        $scope._editing = false;
      } else {
        tagsSnap = angular.copy(user.tags);
        tagsSnap = _.object(_.pluck(tagsSnap,'id'), tagsSnap);
        $scope._editing = true;
      }
    };

    $scope.toggleFilter = function(tag) {
      if (!user.filters[tag.id]) {
        user.filters[tag.id] = true;
      } else {
        delete user.filters[tag.id];
      }

      // no longer persisting this, it was causing a lot of confusion - users thought they'd permanently lost tasks
      // Note: if we want to persist for just this computer, easy method is:
      // User.save();
    };

    $scope.updateTaskFilter = function(){
      user.filterQuery = $scope.filterQuery;
    };
    $scope.updateTaskFilter();

    $scope.createTag = function() {
      User.addTag({body:{name: $scope._newTag.name, id: Shared.uuid()}});
      $scope._newTag.name = '';
    };
}]);
