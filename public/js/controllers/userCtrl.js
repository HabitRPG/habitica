"use strict";

habitrpg.controller("UserCtrl", ['$scope', '$location', 'User',
  function($scope, $location, User) {
  $scope.profile = User.user;
  $scope.hideUserAvatar = function() {
    $(".userAvatar").hide();
  };
  $scope.toggleHelm = function(val){
    User.log({op:'set', data:{'preferences.showHelm':val}});
  }
  $scope.addWebsite = function(){
    if (!User.user.profile.websites) User.user.profile.websites = [];
    User.user.profile.websites.push($scope._newWebsite);
    User.set('profile.websites', User.user.profile.websites);
    $scope._newWebsite = '';
  }
  $scope.removeWebsite = function($index){
    User.user.profile.websites.splice($index,1);
    User.set('profile.websites', User.user.profile.websites);
  }
}]);
