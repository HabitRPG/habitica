"use strict";

habitrpg.controller("UserCtrl", ['$rootScope', '$scope', '$location', 'User', '$http', '$state', 'Guide', 'Shared', 'Content', 'Stats', 'Social',
  function($rootScope, $scope, $location, User, $http, $state, Guide, Shared, Content, Stats, Social) {
    $scope.profile = User.user;

    $scope.statCalc = Stats;

    $scope.loadWidgets = Social.loadWidgets;

    $scope.hideUserAvatar = function() {
      $(".userAvatar").hide();
    };

    $scope.$watch('_editing.profile', function(value){
      if(value === true) $scope.editingProfile = angular.copy(User.user.profile);
    });

    $scope.allocate = function(stat){
      User.allocate({query:{stat:stat}});
    }

    $scope.changeClass = function(klass){
      if (!klass) {
        if (!confirm(window.env.t('sureReset')))
          return;
        return User.changeClass({});
      }

      User.changeClass({query:{class:klass}});
      $scope.selectedClass = undefined;
      Shared.updateStore(User.user);
      Guide.goto('classes', 0,true);
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

    $scope.acknowledgeHealthWarning = function(){
      User.set({'flags.warnedLowHealth':true});
    }

    /**
     * For gem-unlockable preferences, (a) if owned, select preference (b) else, purchase
     * @param path: User.preferences <-> User.purchased maps like User.preferences.skin=abc <-> User.purchased.skin.abc.
     *  Pass in this paramater as "skin.abc". Alternatively, pass as an array ["skin.abc", "skin.xyz"] to unlock sets
     */
    $scope.unlock = function(path){
      var fullSet = ~path.indexOf(',');
      var cost =
        ~path.indexOf('background.') ?
          (fullSet ? 3.75 : 1.75) : // (Backgrounds) 15G per set, 7G per individual
          (fullSet ? 1.25 : 0.5); // (Hair, skin, etc) 5G per set, 2G per individual


      if (fullSet) {
        if (confirm(window.env.t('purchaseFor',{cost:cost*4})) !== true) return;
        if (User.user.balance < cost) return $rootScope.openModal('buyGems');
      } else if (!_.get(User.user, 'purchased.' + path)) {
        if (confirm(window.env.t('purchaseFor',{cost:cost*4})) !== true) return;
        if (User.user.balance < cost) return $rootScope.openModal('buyGems');
      }
      User.unlock({query:{path:path}})
    }

    $scope.ownsSet = function(type,_set) {
      return !_.find(_set,function(v,k){
        return !User.user.purchased[type][k];
      });
    }
    $scope.setKeys = function(type,_set){
      return _.map(_set, function(v,k){
        return type+'.'+k;
      }).join(',');
    }

  }
]);
