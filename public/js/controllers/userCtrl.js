"use strict";

habitrpg.controller("UserCtrl", ['$rootScope', '$scope', '$location', 'User', '$http',
  function($rootScope, $scope, $location, User, $http) {
    $scope.profile = User.user;
    $scope.hideUserAvatar = function() {
      $(".userAvatar").hide();
    };
    $scope.toggleHelm = function(val){
      User.log({op:'set', data:{'preferences.showHelm':val}});
    }

    $scope.$watch('_editing.profile', function(value){
      if(value === true) $scope.editingProfile = angular.copy(User.user.profile);
    });

    $scope.save = function(){
      var values = {};
      _.each($scope.editingProfile, function(value, key){
        // Using toString because we need to compare two arrays (websites)
        if($scope.editingProfile[key].toString() !== $scope.profile.profile[key].toString()) values['profile.' + key] = value;
      });
      User.setMultiple(values);
      $scope._editing.profile = false;
    }

    $scope.addWebsite = function(){
      if (!$scope.editingProfile.websites) $scope.editingProfile.websites = [];
      $scope.editingProfile.websites.push($scope._newWebsite);
      $scope._newWebsite = '';
    }
    $scope.removeWebsite = function($index){
      $scope.editingProfile.websites.splice($index,1);
    }

    /**
     * For gem-unlockable preferences, (a) if owned, select preference (b) else, purchase
     * @param path: User.preferences <-> User.purchased maps like User.preferences.skin=abc <-> User.purchased.skin.abc. Pass in this paramater as "skin.abc"
     */
    $scope.unlock = function(path){
      if (window.habitrpgShared.helpers.dotGet('purchased.' + path, User.user)) {
        var pref = path.split('.')[0],
          val = path.split('.')[1];
        window.habitrpgShared.helpers.dotSet('preferences.' + pref, val, User.user);
      } else {
        if (confirm("Purchase for 2 Gems?") !== true) return;
        if (User.user.balance < 0.5) return $rootScope.modals.moreGems = true;
        User.unlock(path);
      }
    }
  }
]);
