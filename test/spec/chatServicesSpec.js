'use strict';

describe('Chat Service', function() {
  var $httpBackend, $http, chat, user;

  beforeEach(function() {
    module(function($provide) {
      var usr = specHelper.newUser();
      $provide.value('User', {user:usr});
    });

    inject(function(_$httpBackend_, Chat, User) {
      $httpBackend = _$httpBackend_;
      chat = Chat;
      user = User;
    });
  });

  describe('utils', function() {
    it('calls post chat endpoint', function() {
      var payload = {
        gid: 'habitrpg',
        message: 'Chat',
        previousMsg: 'previous-msg-id'
      }

      $httpBackend.expectPOST('/api/v2/groups/habitrpg/chat?message=Chat&previousMsg=previous-msg-id').respond();
      chat.utils.postChat(payload, undefined);
      $httpBackend.flush();
    });

    it('calls like chat endpoint', function() {
      var payload = {
        gid: 'habitrpg',
        messageId: 'msg-id'
      }

      $httpBackend.expectPOST('/api/v2/groups/habitrpg/chat/msg-id/like').respond();
      chat.utils.like(payload, undefined);
      $httpBackend.flush();
    });

    it('calls delete chat endpoint', function() {
      var payload = {
        gid: 'habitrpg',
        messageId: 'msg-id'
      }

      $httpBackend.expectDELETE('/api/v2/groups/habitrpg/chat/msg-id').respond();
      chat.utils.deleteChatMessage(payload, undefined);
      $httpBackend.flush();
    });

    it('calls flag chat endpoint', function() {
      var payload = {
        gid: 'habitrpg',
        messageId: 'msg-id'
      }

      $httpBackend.expectPOST('/api/v2/groups/habitrpg/chat/msg-id/flag').respond();
      chat.utils.flagChatMessage(payload, undefined);
      $httpBackend.flush();
    });

    it('calls clear flags endpoint', function() {
      var payload = {
        gid: 'habitrpg',
        messageId: 'msg-id'
      }

      $httpBackend.expectPOST('/api/v2/groups/habitrpg/chat/msg-id/clearflags').respond();
      chat.utils.clearFlagCount(payload, undefined);
      $httpBackend.flush();
    });
  });

  describe('seenMessage(gid)', function() {
    it('calls chat seen endpoint', function() {
      $httpBackend.expectPOST('/api/v2/groups/habitrpg/chat/seen').respond();
      chat.seenMessage('habitrpg');
      $httpBackend.flush();
    });

    it('removes newMessages for a specific guild from user object', function() {
      user.user.newMessages = {habitrpg: "foo"};
      chat.seenMessage('habitrpg');
      expect(user.user.newMessages.habitrpg).to.not.exist;
    });
  });
});
