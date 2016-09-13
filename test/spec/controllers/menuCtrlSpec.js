'use strict';

describe('Menu Controller', function() {

  describe('MenuCtrl', function(){
    var scope, ctrl, user, $httpBackend, $window;

    beforeEach(function(){
      module(function($provide) {
        $provide.value('Chat', { seenMessage: function() {} });
        $provide.value('User', { clearInviteAcceptedNotification: function() {} });
      });

      inject(function(_$httpBackend_, $rootScope, $controller, User) {
        scope = $rootScope.$new();

        ctrl = $controller('MenuCtrl', {$scope: scope, $window: $window});
      })
    });

    describe('clearMessage', function() {
      it('is Chat.seenMessage', inject(function(Chat) {
        expect(scope.clearMessages).to.eql(Chat.markChatSeen);
      }));
    });
  });
});
