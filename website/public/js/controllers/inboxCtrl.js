'use strict';

habitrpg.controller("InboxCtrl", ['$scope', '$rootScope',
    function($scope, $rootScope) {
      $scope.copyToDo = function(message) {

        var messageUser = null
        if (message.uuid == 'system') {
          messageUser = 'system';
        }
        else {
          messageUser = message.user;
        }

        var taskNotes = env.t("taskFromInbox",  {
          from: messageUser,
          message: message.text
        });

        var taskText = env.t("taskTextFromInbox", {
          from: messageUser
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
