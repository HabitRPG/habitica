"use strict";

habitrpg.controller("UserCtrl", ['$rootScope', '$scope', '$location', 'User', '$http',
  function($rootScope, $scope, $location, User, $http) {
    $scope.profile = User.user;
    $scope.hideUserAvatar = function() {
      $(".userAvatar").hide();
    };

    $scope.$watch('_editing.profile', function(value){
      if(value === true) $scope.editingProfile = angular.copy(User.user.profile);
    });

    $scope.allocate = function(stat){
      User.user.ops.allocate({query:{stat:stat}});
    }

    $scope.changeClass = function(klass){
      if (!klass) {
        if (!confirm("Are you sure you want to re-roll? This will reset your character's class and allocated points (you'll get them all back to re-allocate)"))
          return;
        return User.user.ops.changeClass({});
      }

      User.user.ops.changeClass({query:{class:klass}});
      $scope.selectedClass = undefined;

      User.user.fns.updateStore();
    }

    $scope.save = function(){
      var values = {};
      _.each($scope.editingProfile, function(value, key){
        // Using toString because we need to compare two arrays (websites)
        var curVal = $scope.profile.profile[key];
        if(!curVal || $scope.editingProfile[key].toString() !== curVal.toString())
          values['profile.' + key] = value;
      });
      User.set(values);
      $scope._editing.profile = false;
    }

    /**
     * For gem-unlockable preferences, (a) if owned, select preference (b) else, purchase
     * @param path: User.preferences <-> User.purchased maps like User.preferences.skin=abc <-> User.purchased.skin.abc.
     *  Pass in this paramater as "skin.abc". Alternatively, pass as an array ["skin.abc", "skin.xyz"] to unlock sets
     */
    $scope.unlock = function(path){
      var fullSet = ~path.indexOf(',');
      var cost = fullSet ? 1.25 : 0.5; // 5G per set, 2G per individual

      if (fullSet) {
        if (confirm("Purchase for 5 Gems?") !== true) return;
        if (User.user.balance < cost) return $rootScope.modals.buyGems = true;
      } else if (!User.user.fns.dotGet('purchased.' + path)) {
        if (confirm("Purchase for 2 Gems?") !== true) return;
        if (User.user.balance < cost) return $rootScope.modals.buyGems = true;
      }
      User.user.ops.unlock({query:{path:path}})
    }

  }
]);
