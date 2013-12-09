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
        'flags.classSelected': false,
        //'stats.points': this is handled on the server
        'stats.str': 0,
        'stats.def': 0,
        'stats.per': 0,
        'stats.int': 0
      })
    }
    $scope.rerollSubmit = function(){
      var klass = $scope.selectedClass;
      var setVars = {
        "stats.class": klass,
        "flags.classSelected": true
      };

      // Clear their gear and equip their new class's gear (can still equip old gear from inventory)
      // If they've rolled this class before, restore their progress
      _.each(['weapon', 'armor','shield','head'], function(type){
        var foundKey = false;
        _.findLast(User.user.items.gear.owned, function(v,k){
          if (~k.indexOf(type + '_' + klass)) {
            foundKey = k;
            return true;
          }
        });
        setVars['items.gear.equipped.' + type] =
          foundKey ? foundKey : // restore progress from when they last rolled this class
          (type == 'weapon') ? 'weapon_' + klass + '_0' : // weapon_0 is significant, don't reset to base_0
          (type == 'shield' && klass == 'rogue') ? 'shield_rogue_0' : // rogues start with an off-hand weapon
          type + '_base_0'; // naked for the rest!

        // Grant them their new class's gear
        if (type == 'weapon' || (type == 'shield' && klass == 'rogue'))
          setVars['items.gear.owned.' + type + '_' + klass + '_0'] = true;
      });

      User.setMultiple(setVars);
      $scope.selectedClass = undefined;

      //FIXME run updateStore (we need to access a different scope)
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

    $scope.set_costume = function(shirt) {
      User.setMultiple({
        'preferences.useCostume': true,
        'preferences.armorSet': shirt,
        'items.gear.costume.armor': 'armor_base_0',
      });
    }
  }
]);
