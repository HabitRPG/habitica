"use strict";

/* Make user and settings available for everyone through root scope.
 */

habitrpg.controller("RootCtrl", function($scope, $rootScope, $location, User) {
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

  /*
   Very simple path-set. `set('preferences.gender','m')` for example. We'll deprecate this once we have a complete API
   */
  $rootScope.set = function(k, v) {
    var log = { op: 'set', data: {} };
    window.habitrpgShared.helpers.dotSet(k, v, User.user);
    log.data[k] = v;
    User.log(log);
  };

  $rootScope.authenticated = function() {
    User.settings.auth.apiId !== "";
  };

  $rootScope.dismissAlert = function() {
    $rootScope.modals.newStuff = false;
    $rootScope.set('flags.newStuff',false);
  }

});
