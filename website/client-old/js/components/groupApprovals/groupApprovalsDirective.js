'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('groupApprovals', groupApprovals);

  groupApprovals.$inject = [
  ];

  function groupApprovals() {

    return {
      scope: {
        group: '=',
      },
      templateUrl: 'partials/groups.tasks.approvals.html',
      controller: 'GroupApprovalsCtrl',
    };
  }
}());
