"use strict";

habitrpg.controller("FiltersCtrl", ['$scope', '$rootScope', 'User',
  function($scope, $rootScope, User) {
    var user = User.user;
    $scope._editing = false;

    $scope.saveOrEdit = function(){
      if ($scope._editing) {
        User.log({op:'set',data:{'tags':user.tags}});
      }
      $scope._editing = !$scope._editing;
    }


    $scope.toggleFilter = function(tag) {
      // no longer persisting this, it was causing a lot of confusion - users thought they'd permanently lost tasks
      user.filters = user.filters ? user.filters : {};
      user.filters[tag.id] = !user.filters[tag.id];
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


//    $scope.remove = function(tag, $index){
//
//      /*
//      something got corrupted, let's clear the corrupt tags
//      FIXME we can remove this once Angular has been live for a while
//       */
//      if (!tag.id) {
//        user.tags = _.filter(user.tags, (function(t) {
//          return t != null ? t.id : false;
//        }));
//        user.filters = {};
//        return;
//      }
//
//      delete user.filters[tag.id];
//
//      splice(user.tags,$index,1);
//
//      // remove tag from all tasks
//      _.each(user.tasks, function(task) {
//        delete user.tasks[task.id].tags[tag.id];
//      });
//
//    }

}]);
