'use strict';

describe("Chat Controller", function() {
  var scope, ctrl, user, $rootScope, $controller;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function(_$rootScope_, _$controller_){
      user = specHelper.newUser();
      user._id = "unique-user-id";
      $rootScope = _$rootScope_;

      scope = _$rootScope_.$new();

      $controller = _$controller_;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('ChatCtrl', {$scope: scope});
    });
  });

  describe('copyToDo', function() {
    it('when copying a user message it opens modal with information from message', function() {
      scope.group = {
        name: "Princess Bride"
      };

      var modalSpy = sandbox.spy($rootScope, "openModal");
      var message = {
        uuid: 'the-dread-pirate-roberts',
        user: 'Wesley',
        text: 'As you wish'
      };

      scope.copyToDo(message);

      modalSpy.should.have.been.calledOnce;

      modalSpy.should.have.been.calledWith('copyChatToDo', sinon.match(function(callArgToMatch){
        return callArgToMatch.controller == 'CopyMessageModalCtrl'
            && callArgToMatch.scope.text == message.text
      }));
    });

    it('when copying a system message it opens modal with information from message', function() {
      scope.group = {
        name: "Princess Bride"
      };

      var modalSpy = sandbox.spy($rootScope, "openModal");
      var message = {
        uuid: 'system',
        text: 'Wesley attacked the ROUS in the Fire Swamp'
      };

      scope.copyToDo(message);

      modalSpy.should.have.been.calledOnce;

      modalSpy.should.have.been.calledWith('copyChatToDo', sinon.match(function(callArgToMatch){
        return callArgToMatch.controller == 'CopyMessageModalCtrl'
            && callArgToMatch.scope.text == message.text
      }));
    });
  });
});

