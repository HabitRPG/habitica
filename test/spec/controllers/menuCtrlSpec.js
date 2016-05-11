'use strict';

describe('Menu Controller', function() {

  describe('MenuCtrl', function(){
    var scope, ctrl, user, $httpBackend, $window;

    beforeEach(function(){
      module(function($provide) {
        $provide.value('Chat', { seenMessage: function() {} });
      });

      inject(function(_$httpBackend_, $rootScope, $controller) {
        scope = $rootScope.$new();

        ctrl = $controller('MenuCtrl', {$scope: scope, $window: $window, User: user});
      })
    });

    describe('clearMessage', function() {
      it('is Chat.seenMessage', inject(function(Chat) {
        expect(scope.clearMessages).to.eql(Chat.markChatSeen);
      }));
    });
  });
});
