'use strict';

describe('chatServices', function() {
  var $httpBackend, $http, chat, user;
  var apiV3Prefix = '/api/v3';

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {user:user});
    });

    inject(function(_$httpBackend_, Chat, User) {
      $httpBackend = _$httpBackend_;
      chat = Chat;
      user = User;
      user.sync = function(){};
    });
  });

  it('calls get chat endpoint', function() {
    var groupId = 1;
    $httpBackend.expectGET(apiV3Prefix + '/groups/' + groupId + '/chat').respond({});
    chat.getChat(groupId);
    $httpBackend.flush();
  });

  it('calls get chat endpoint', function() {
    var groupId = 1;
    var message = "test message";
    $httpBackend.expectPOST(apiV3Prefix + '/groups/' + groupId + '/chat').respond({});
    chat.postChat(groupId, message);
    $httpBackend.flush();
  });

  it('calls delete chat endpoint', function() {
    var groupId = 1;
    var chatId = 2;
    $httpBackend.expectDELETE(apiV3Prefix + '/groups/' + groupId + '/chat/' + chatId).respond({});
    chat.deleteChat(groupId, chatId);
    $httpBackend.flush();
  });

  it('calls like chat endpoint', function() {
    var groupId = 1;
    var chatId = 2;
    $httpBackend.expectPOST(apiV3Prefix + '/groups/' + groupId + '/chat/' + chatId + '/like').respond({});
    chat.like(groupId, chatId);
    $httpBackend.flush();
  });

  it('calls flag chat endpoint', function() {
    var groupId = 1;
    var chatId = 2;
    $httpBackend.expectPOST(apiV3Prefix + '/groups/' + groupId + '/chat/' + chatId + '/flag').respond({});
    chat.flagChatMessage(groupId, chatId);
    $httpBackend.flush();
  });

  it('calls clearflags chat endpoint', function() {
    var groupId = 1;
    var chatId = 2;
    $httpBackend.expectPOST(apiV3Prefix + '/groups/' + groupId + '/chat/' + chatId + '/clearflags').respond({});
    chat.clearFlagCount(groupId, chatId);
    $httpBackend.flush();
  });

  it('calls chat seen endpoint', function() {
    var groupId = 1;
    $httpBackend.expectPOST(apiV3Prefix + '/groups/' + groupId + '/chat/seen').respond({});
    chat.markChatSeen(groupId);
    $httpBackend.flush();
  });
});
