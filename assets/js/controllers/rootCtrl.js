"use strict";

/* Make user and settings available for everyone through root scope.
 */

habitrpg.controller("RootCtrl", ['$scope', '$rootScope', '$location', 'User', '$http',
  function($scope, $rootScope, $location, User, $http) {
  $rootScope.modals = {};
  $rootScope.User = User;
  $rootScope.user = User.user;
  $rootScope.settings = User.settings;
  $rootScope.flash = {errors: [], warnings: []};

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

  $rootScope.showStripe = function() {
      var disableAds = User.user.flags.ads == 'hide' ? '' : 'Disable Ads, ';
      StripeCheckout.open({
        key: window.env.STRIPE_PUB_KEY,
        address: false,
        amount: 500,
        name: "Checkout",
        description: "Buy 20 Gems, " + disableAds + "Support the Developers",
        panelLabel: "Checkout",
        token: function(data) {
          $scope.$apply(function(){
            $http.post("/api/v1/user/buy-gems", data)
              .success(function() {
                window.location.href = "/";
              }).error(function(err) {
                alert(err);
              });
          })
        }
      });
  }
}]);
