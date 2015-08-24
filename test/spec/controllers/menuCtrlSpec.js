'use strict';

describe('Menu Controller', function() {

  describe('MenuCtrl', function(){
    var scope, ctrl, user, User, $httpBackend, $window, rootScope;

    beforeEach(function(){
      module(function($provide) {
        $provide.value('Chat', { seenMessage: function() {} });
        user = specHelper.newUser();
        user._id = "unique-user-id";
        User = {
          sync: sandbox.stub(),
          set: sandbox.stub(),
          user: user,
        }
        $provide.value('User', User);
      });

      inject(function(_$httpBackend_, _$controller_, _$rootScope_) {
        user = specHelper.newUser();
        user._id = "unique-user-id";

        scope =  _$rootScope_.$new();
        rootScope = _$rootScope_;

        // Load RootCtrl to ensure shared behaviors are loaded
        _$controller_('RootCtrl',  {$scope: scope, User: User});

        ctrl = _$controller_('MenuCtrl', {$scope: scope, $window: $window, User: User});
      })
    });

    describe('iconClasses', function() {
      beforeEach(function() {
        scope.user = User.user;
        scope.user.invitations = [];
        scope.user.flags.bootedFromGroupNotifications = [];
      });

      it('should return comment inactive icon when there are no messages', function() {
        expect(scope.iconClasses()).to.eql("glyphicon-comment inactive");
      });

      it('should return comment icon when there is a group notification', function() {
        scope.user.flags.bootedFromGroupNotifications = [
          {"name": "GroupBootedFrom", "message": "You are inactive"}
        ];
        expect(scope.iconClasses()).to.eql("glyphicon-comment");
      });
    });

    describe('clearMessage', function() {
      it('is Chat.seenMessage', inject(function(Chat) {
        expect(scope.clearMessages).to.eql(Chat.seenMessage);
      }));
    });

    describe('Booted Group Notifications', function() {
      beforeEach(function() {
        sandbox.stub(rootScope, 'openModal');
      });

      it('clears one booted from group notification', function() {
        User.user.flags.bootedFromGroupNotifications = [
          {"name": "GroupBootedFrom", "message": "You are inactive"}
        ];
        scope.seeBootedFromGroupNotification(0)
        expect(User.user.flags.bootedFromGroupNotifications).to.eql([]);
      });

      it('clears two booted from group notifications', function() {
        User.user.flags.bootedFromGroupNotifications = [
          {"name": "GroupBootedFrom", "message": "You are inactive"},
          {"name": "GroupBootedFrom2", "message": "You are inactive again"}
        ];
        scope.seeBootedFromGroupNotification(1)
        expect(User.user.flags.bootedFromGroupNotifications).to.eql([{"name": "GroupBootedFrom", "message": "You are inactive"}]);
        scope.seeBootedFromGroupNotification(0)
        expect(User.user.flags.bootedFromGroupNotifications).to.eql([]);
      });
    });
  });
});
