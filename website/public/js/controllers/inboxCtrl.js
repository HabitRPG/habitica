'use strict';

habitrpg.controller("InboxCtrl", ['$scope', '$rootScope',
    function($scope, $rootScope) {
      $scope.copyToDo = function(message) {
        var taskNotes = env.t("taskFromInbox",  {
          from: message.uuid == 'system'
            ? 'system'
            : message.user,
          message: message.text
        });
        var taskText = env.t("taskTextFromInbox", {
          from: message.uuid == 'system'
            ? 'system'
            :  message.user
        });

        var newScope = $scope.$new();
        newScope.text = taskText;
        newScope.notes = taskNotes;

        $rootScope.openModal('copyChatToDo',{
          controller:'CopyMessageModalCtrl',
          scope: newScope
        });
      };
    }
  ]);
