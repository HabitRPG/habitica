'use strict';

(function(){
  angular
    .module('habitrpg')
    .directive('groupTaskMetaActions', hrpgSortTags);

  hrpgSortTags.$inject = [
  ];

  function hrpgSortTags() {

    return {
      scope: {
        task: '=',
        group: '=',
      },
      templateUrl: 'partials/groups.tasks.meta.actions.html',
      controller: 'GroupTaskMetaActionsCtrl',
    };
  }
}());
