"use strict";

/*
 A controller to manage the Group Plans page
 */

angular.module('habitrpg')
  .controller("GroupPlansCtrl", ['$scope', '$window', 'Groups', 'Payments',
    function($scope, $window, Groups, Payments) {
      $scope.PAGES = {
        BENEFITS: 'benefits',
      };
      $scope.activePage = $scope.PAGES.BENEFITS;

      $scope.changePage = function (page) {
        $scope.activePage = page;
        $window.scrollTo(0, 0);
      };
    }]);
