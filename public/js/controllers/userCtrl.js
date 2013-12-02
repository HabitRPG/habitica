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
      var setObj = {}
      setObj['stats.' + stat] = User.user.stats[stat] + 1;
      setObj['stats.points'] = User.user.stats.points - 1;
      User.setMultiple(setObj);
    }

    $scope.rerollClass = function(){
      if (!confirm("Are you sure you want to re-roll? This will reset your character's class and allocated points (you'll get them all back to re-allocate)"))
        return;
      User.setMultiple({
        'stats.class': '',
        //'stats.points': this is handled on the server
        'stats.str': 0,
        'stats.def': 0,
        'stats.per': 0,
        'stats.int': 0
      })

    }

    $scope.save = function(){
      var values = {};
      _.each($scope.editingProfile, function(value, key){
        // Using toString because we need to compare two arrays (websites)
        var curVal = $scope.profile.profile[key];
        if(!curVal || $scope.editingProfile[key].toString() !== curVal.toString())
          values['profile.' + key] = value;
      });
      User.setMultiple(values);
      $scope._editing.profile = false;
    }

    $scope.unlock = User.unlock;

  }
]);
