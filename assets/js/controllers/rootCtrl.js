"use strict";

/* Make user and settings available for everyone through root scope.
 */

habitrpg.controller("RootCtrl", ['$scope', '$rootScope', '$location', 'User',
  function($scope, $rootScope, $location, User) {
  $rootScope.modals = {};
  $rootScope.User = User;
  $rootScope.user = User.user;
  $rootScope.settings = User.settings;

  /*
   FIXME this is dangerous, organize helpers.coffee better, so we can group them by which controller needs them,
   and then simply _.defaults($scope, Helpers.user) kinda thing
   */
  _.defaults($rootScope, window.habitrpgShared.algos);
  _.defaults($rootScope, window.habitrpgShared.helpers);

  $rootScope.set = User.set;
  $rootScope.authenticated = User.authenticated;

  $rootScope.dismissAlert = function() {
    $rootScope.modals.newStuff = false;
    $rootScope.set('flags.newStuff',false);
  }

  $rootScope.notPorted = function(){
    alert("This feature is not yet ported from the original site.");
  }

}]);
