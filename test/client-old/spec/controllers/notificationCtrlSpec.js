'use strict';

describe('Notification Controller', function() {
  var user, scope, rootScope, fakeBackend, achievement, ctrl;

  beforeEach(function() {
    user = specHelper.newUser();
    user._id = "unique-user-id";

    var userSync = sinon.stub().returns({
      then: function then (f) { f(); }
    });

    let User = {
      user,
      readNotification: function noop () {},
      sync: userSync
    };

    module(function($provide) {
      $provide.value('User', User);
      $provide.value('Guide', {});
    });

    inject(function(_$rootScope_, $httpBackend, _$controller_, Achievement, Shared) {
      scope = _$rootScope_.$new();
      rootScope = _$rootScope_;

      fakeBackend = $httpBackend;
      fakeBackend.when('GET', 'partials/main.html').respond({});

      achievement = Achievement;

      Shared.wrap(user);

      // Load RootCtrl to ensure shared behaviors are loaded
      _$controller_('RootCtrl',  {$scope: scope, User});

      ctrl = _$controller_('NotificationCtrl', {$scope: scope, User});
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

  describe('User challenge won notification watch', function() {
    it('opens challenge won modal when a challenge-won notification is recieved', function() {
      rootScope.$digest();
      rootScope.userNotifications.push({type: 'WON_CHALLENGE'});
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('wonChallenge');
    });

    it('does not open challenge won modal if no new challenge-won notification is recieved', function() {
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('wonChallenge');
    });
  });

  describe('User streak achievement notification watch', function() {
    it('opens streak achievement modal when a streak-achievement notification is recieved', function() {
      rootScope.$digest();
      rootScope.userNotifications.push({type: 'STREAK_ACHIEVEMENT'});
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('streak', {size: 'md'});
    });

    it('does not open streak achievement modal if no new streak-achievement notification is recieved', function() {
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('streak', {size: 'md'});
    });
  });

  describe('User ultimate gear set achievement notification watch', function() {
    it('opens ultimate gear set achievement modal when an ultimate-gear-achievement notification is recieved', function() {
      rootScope.$digest();
      rootScope.userNotifications.push({type: 'ULTIMATE_GEAR_ACHIEVEMENT'});
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('ultimateGear', {size: 'md'});
    });

    it('does not open ultimate gear set achievement modal if no new ultimate-gear-achievement notification is recieved', function() {
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('ultimateGear', {size: 'md'});
    });
  });

  describe('User rebirth achievement notification watch', function() {
    it('opens rebirth achievement modal when a rebirth-achievement notification is recieved', function() {
      rootScope.$digest();
      rootScope.userNotifications.push({type: 'REBIRTH_ACHIEVEMENT'});
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('rebirth');
    });

    it('does not open rebirth achievement modal if no new rebirth-achievement notification is recieved', function() {
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('rebirth');
    });
  });

  describe('User contributor achievement notification watch', function() {
    it('opens contributor achievement modal when a new-contributor-level notification is recieved', function() {
      rootScope.$digest();
      rootScope.userNotifications.push({type: 'NEW_CONTRIBUTOR_LEVEL'});
      rootScope.$digest();

      expect(achievement.displayAchievement).to.be.called;
      expect(achievement.displayAchievement).to.be.calledWith('contributor', {size: 'md'});
    });

    it('does not open contributor achievement modal if no new new-contributor-level notification is recieved', function() {
      rootScope.$digest();
      rootScope.$digest();

      expect(achievement.displayAchievement).to.not.be.calledWith('contributor', {size: 'md'});
    });
  });
});
