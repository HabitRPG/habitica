'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('groupTasksActions', hrpgSortTags);

  hrpgSortTags.$inject = [
  ];

  function hrpgSortTags() {

    return {
      scope: true,
      templateUrl: 'partials/groups.tasks.actions.html',
      controller: 'GroupTaskActionsCtrl',
      link: function($scope, element, attrs, ngModel) {
      },
    };
  }
}());
