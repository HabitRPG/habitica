"use strict";

habitrpg
.controller("DonateModalCtrl", ['$scope', 'Payments',
  function($scope, Payments) {
    $scope.donate = function () {
      console.log($scope.amount)
      Payments.checkoutWithPaypal({donation: $scope.amount});
    };
  }
]);
