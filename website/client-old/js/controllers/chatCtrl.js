'use strict';

habitrpg.controller('ChatCtrl', ['$scope', 'Groups', 'Chat', 'User', '$http', 'ApiUrl', 'Notification', 'Members', '$rootScope', 'Analytics',
    function($scope, Groups, Chat, User, $http, ApiUrl, Notification, Members, $rootScope, Analytics){
    $scope.message = {content:''};
    $scope._sending = false;

    $scope.isUserMentioned = function(user, message) {
      if(message.hasOwnProperty("highlight"))
        return message.highlight;
      message.highlight = false;
      var messagetext = message.text.toLowerCase();
      var username = user.profile.name;
      var mentioned = messagetext.indexOf(username.toLowerCase());
      var pattern = username+"([^\w]|$){1}";
      if(mentioned > -1) {
        var preceedingchar = messagetext.substring(mentioned-1,mentioned);
        if(mentioned == 0 || preceedingchar.trim() == '' || preceedingchar == '@'){
          var regex = new RegExp(pattern,'i');
          message.highlight = regex.test(messagetext);
        }
      }
      return message.highlight;
    }

    $scope.postChat = function(group, message){
      if (_.isEmpty(message) || $scope._sending) return;
      $scope._sending = true;

      var previousMsg = false;
      if (group.type !== 'party' && group.chat && group.chat[0]) { // not sending the previousMsg for parties as we have real time updates
        previousMsg = group.chat[0].id;
      }

      Chat.postChat(group._id, message, previousMsg)
        .then(function(response) {
          var message = response.data.data.message;

          if (message) {
            group.chat.unshift(message);
            group.chat.splice(200);
          } else {
            group.chat = response.data.data.chat;
          }

          $scope.message.content = '';
          $scope._sending = false;

          if (group.type == 'party') {
            Analytics.updateUser({'partyID': group.id, 'partySize': group.memberCount});
          }

          if (group.privacy == 'public'){
            Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'group chat','groupType':group.type,'privacy':group.privacy,'groupName':group.name});
          } else {
            Analytics.track({'hitType':'event','eventCategory':'behavior','eventAction':'group chat','groupType':group.type,'privacy':group.privacy});
          }
        }, function(err){
          $scope._sending = false;
        });
    }

    $scope.deleteChatMessage = function(group, message){
      if(message.uuid === User.user.id || (User.user.backer && User.user.contributor.admin)){
        var previousMsg = (group.chat && group.chat[0]) ? group.chat[0].id : false;
        if (confirm('Are you sure you want to delete this message?')) {
          Chat.deleteChat(group._id, message.id, previousMsg)
            .then(function (response) {
              var i = _.findIndex(group.chat, {id: message.id});
              if(i !== -1) group.chat.splice(i, 1);
            });
        }
      }
    }

    $scope.likeChatMessage = function(group, message) {
      if (message.uuid == User.user._id)
        return Notification.text(window.env.t('foreverAlone'));

      if (!message.likes) message.likes = {};

      if (message.likes[User.user._id]) {
        delete message.likes[User.user._id];
      } else {
        message.likes[User.user._id] = true;
      }

      Chat.like(group._id, message.id);
    }

    $scope.flagChatMessage = function(groupId,message) {
      if(!message.flags) message.flags = {};

      if (!User.user.contributor.admin && message.flags[User.user._id]) {
        Notification.text(window.env.t('abuseAlreadyReported'));
      } else {
        $scope.abuseObject = message;
        $scope.groupId = groupId;

        $scope.isSystemMessage = message.uuid === 'system';
        $rootScope.openModal('abuse-flag',{
          controller:'MemberModalCtrl',
          scope: $scope
        });
      }
    };

    $scope.copyToDo = function(message) {
      var taskNotes = env.t("messageWroteIn",  {
        user: message.uuid == 'system'
            ? 'system'
            : '[' + message.user + '](' + env.BASE_URL + '/static/front/#?memberId=' + message.uuid + ')',
        group: '[' + $scope.group.name + '](' + window.location.href + ')'
      });

      var newScope = $scope.$new();
      newScope.text = message.text;
      newScope.notes = taskNotes;

      $rootScope.openModal('copyChatToDo',{
        controller:'CopyMessageModalCtrl',
        scope: newScope
      });
    };

    function handleGroupResponse (response) {
      $scope.group = response;
      if (!$scope.group._id) $scope.group = response.data.data;
    };

    $scope.sync = function(group) {
      if (group.name === Groups.TAVERN_NAME) {
        Groups.tavern(true).then(handleGroupResponse);
      } else if (group._id === User.user.party._id) {
        Groups.party(true).then(handleGroupResponse);
      } else {
        Groups.Group.get(group._id).then(handleGroupResponse);
      }

      Chat.markChatSeen(group._id);
    }

    // List of Ordering options for the party members list
    $scope.partyOrderChoices = {
      'level': window.env.t('sortLevel'),
      'random': window.env.t('sortRandom'),
      'pets': window.env.t('sortPets'),
      'habitrpg_date_joined' : window.env.t('sortHabitrpgJoined'),
      'party_date_joined': window.env.t('sortJoined'),
      'habitrpg_last_logged_in': window.env.t('sortHabitrpgLastLoggedIn'),
      'name': window.env.t('sortName'),
      'backgrounds': window.env.t('sortBackgrounds'),
    };

    $scope.partyOrderAscendingChoices = {
      'ascending': window.env.t('ascendingSort'),
      'descending': window.env.t('descendingSort')
    }

  }]);
