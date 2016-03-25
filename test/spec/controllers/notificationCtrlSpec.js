'use strict';

describe('Notification Controller', function() {
  var user, scope, rootScope, fakeBackend, achievement, ctrl;

  beforeEach(function() {
    user = specHelper.newUser();
    user._id = "unique-user-id";

    module(function($provide) {
      $provide.value('User', {user: user});
      $provide.value('Guide', {});
    });

    inject(function(_$rootScope_, $httpBackend, _$controller_, Achievement) {
      scope = _$rootScope_.$new();
      rootScope = _$rootScope_;

      fakeBackend = $httpBackend;
      fakeBackend.when('GET', 'partials/main.html').respond({});

      achievement = Achievement;

      // Load RootCtrl to ensure shared behaviors are loaded
      _$controller_('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = _$controller_('NotificationCtrl', {$scope: scope, User: {user: user}});
    });

    sandbox.stub(rootScope, 'openModal');
    sandbox.stub(achievement, 'displayAchievement');
  });

  describe('Quest Invitation modal watch', function() {
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

  describe('User challenge won modal watch', function() {
    it('opens challenge won modal when a challenge is won', function() {
      user.achievements.challenges = [];
      rootScope.$digest();
      user.achievements.challenges = ['test-challenge'];
      rootScope.$digest();

      expect(rootScope.openModal).to.be.called;
      expect(rootScope.openModal).to.be.calledWith('wonChallenge');
    });

    it('does not open challenge won modal if no new challenge is won', function() {
      user.achievements.challenges = [];
      rootScope.$digest();
      rootScope.$digest();

      expect(rootScope.openModal).to.not.be.calledWith('wonChallenge');
    });
  });

  describe('User streak achievement modal watch', function() {
    it('opens streak achievement modal if streak count increases', function() {
      user.achievements.streak = 0;
      rootScope.$digest();
      user.achievements.streak = 1;
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('streak');
    });

    it('does not open streak achievement modal if streak count stays the same', function() {
      user.achievements.streak = 1;
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('streak');
    });
  });

  describe('User ultimate gear set achievement modal watch', function() {
    it('opens ultimate gear set achievement modal if set is acquired', function() {
      rootScope.$digest();
      user.achievements.ultimateGearSets = { warrior:true };
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('ultimateGear');
    });

    it('does not open ultimate gear set achievement modal if no new set is acquired', function() {
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('ultimateGear');
    });
  });

  describe('User rebirth achievement modal watch', function() {
    it('opens rebirth achievement modal if rebirth count increases', function() {
      user.achievements.rebirths = 0;
      rootScope.$digest();
      user.achievements.rebirths = 1;
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('rebirth');
    });

    it('does not open rebirth achievement modal if rebirth count stays the same', function() {
      user.achievements.rebirths = 0;
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('rebirth');
    });
  });

  describe('User contributor flag modal watch', function() {
    it('opens contributor achievement modal if contributor flag changes to true', function() {
      user.flags.contributor = false;
      rootScope.$digest();
      user.flags.contributor = true;
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('contributor');
    });

    it('does not open contributor achievement modal if contributor flag changes to false', function() {
      user.flags.contributor = true;
      rootScope.$digest();
      user.flags.contributor = false;
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('contributor');
    });

    it('does not open contributor achievement modal if contributor flag stays the same', function() {
      user.flags.contributor = true;
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('contributor');
    });
  });
});
