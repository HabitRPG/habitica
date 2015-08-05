'use strict';

describe('Notification Controller', function() {
  var user, scope, rootScope, ctrl;

  beforeEach(function() {
    user = specHelper.newUser();
    user._id = "unique-user-id";

    module(function($provide) {
      $provide.value('User', {user: user});
      $provide.value('Guide', {});
    });

    inject(function(_$rootScope_, _$controller_) {
      scope = _$rootScope_.$new();
      rootScope = _$rootScope_;

      // Load RootCtrl to ensure shared behaviors are loaded
      _$controller_('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = _$controller_('NotificationCtrl', {$scope: scope, User: {user: user}});
    });
  });

  describe('Quest Invitation modal watch', function() {
    beforeEach(function() {
      sandbox.stub(rootScope, 'openModal');
    });

    it('opens quest invitation modal', function() {
      user.party.quest.RSVPNeeded = true;
      delete user.party.quest.completed;
      scope.$digest();

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith('questInvitation', {controller:'PartyCtrl'});
    });

    it('does not open quest invitation modal if RSVPNeeded is not true', function() {
      user.party.quest.RSVPNeeded = false;
      delete user.party.quest.completed;
      scope.$digest();

      expect(rootScope.openModal).to.not.be.called;
    });

    it('does not open quest invitation modal if quest.completed contains a quest key', function() {
      user.party.quest.RSVPNeeded = true;
      user.party.quest.completed = "hedgebeast";
      scope.$digest();

      expect(rootScope.openModal).to.not.be.calledWith('questInvitation', {controller:'PartyCtrl'});
    });
  });

  describe('Quest Completion modal watch', function() {
    beforeEach(function() {
      sandbox.stub(rootScope, 'openModal');
    });

    it('opens quest completion modal', function() {
      user.party.quest.completed = "hedgebeast";
      scope.$digest();

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith('questCompleted', {controller:'InventoryCtrl'});
    });

    // Ensures that the completion modal opens before the invitation modal
    it('opens quest completion modal if RSVPNeeded is true', function() {
      user.party.quest.RSVPNeeded = true;
      user.party.quest.completed = "hedgebeast";
      scope.$digest();

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith('questCompleted', {controller:'InventoryCtrl'});
    });

    it('does not open quest completion modal if quest.completed is null', function() {
      user.party.quest.completed = null;
      scope.$digest();

      expect(rootScope.openModal).to.not.be.called;
    });
  });
});
