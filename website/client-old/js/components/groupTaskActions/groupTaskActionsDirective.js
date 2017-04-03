'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('groupTasksActions', hrpgSortTags);

  hrpgSortTags.$inject = [
  ];

  function hrpgSortTags() {

    return {
      scope: {
        task: '=',
        group: '=',
      },
      templateUrl: 'partials/groups.tasks.actions.html',
      controller: 'GroupTaskActionsCtrl',
    };
  }
}());
