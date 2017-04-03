'use strict';

habitrpg.controller('InboxCtrl', ['$scope', '$rootScope',
  function ($scope, $rootScope) {
    $scope.copyToDo = function (message) {
      var messageUser;

      if (message.uuid == 'system') {
        messageUser = 'system';
      } else {
        messageUser = message.user;
      }

      var newScope = $scope.$new();

      newScope.notes = env.t('taskFromInbox',  {
        from: messageUser,
        message: message.text
      });

      newScope.text = env.t('taskTextFromInbox', {
        from: messageUser
      });

      $rootScope.openModal('copyChatToDo',{
        controller: 'CopyMessageModalCtrl',
        scope: newScope
      });
    };
  }
]);
