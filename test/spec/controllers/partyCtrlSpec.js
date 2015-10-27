'use strict';

describe("Party Controller", function() {
  var scope, ctrl, user, User, questsService, groups, rootScope, $controller;

  beforeEach(function() {
    user = specHelper.newUser(),
    user._id = "unique-user-id";
    User = {
      user: user,
      sync: sandbox.spy
    }

    module(function($provide) {
      $provide.value('User', User);
    });

    inject(function(_$rootScope_, _$controller_, Groups, Quests){

      rootScope = _$rootScope_;

      scope = _$rootScope_.$new();

      $controller = _$controller_;

      groups = Groups;
      questsService = Quests;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: User});

      ctrl = $controller('PartyCtrl', {$scope: scope, User: User});
    });
  });

  describe('questAccept', function() {
    beforeEach(function() {
      scope.group = {
        quest: { members: { 'user-id': true } }
      };
      sandbox.stub(questsService, 'sendAction').returns({
        then: sandbox.stub().yields({members: {another: true}})
      });
    });

    it('calls Quests.sendAction', function() {
      scope.questAccept();

      expect(questsService.sendAction).to.be.calledOnce;
      expect(questsService.sendAction).to.be.calledWith('questAccept');
    });


    it('updates quest object with new participants list', function() {
      scope.group.quest = {
        members: { user: true, another: true }
      };

      scope.questAccept();

      expect(scope.group.quest).to.eql({members: { another: true }});
    });
  });

  describe('questReject', function() {
    beforeEach(function() {
      scope.group = {
        quest: { members: { 'user-id': true } }
      };
      sandbox.stub(questsService, 'sendAction').returns({
        then: sandbox.stub().yields({members: {another: true}})
      });
    });

    it('calls Quests.sendAction', function() {
      scope.questReject();

      expect(questsService.sendAction).to.be.calledOnce;
      expect(questsService.sendAction).to.be.calledWith('questReject');
    });


    it('updates quest object with new participants list', function() {
      scope.group.quest = {
        members: { user: true, another: true }
      };

      scope.questReject();

      expect(scope.group.quest).to.eql({members: { another: true }});
    });
  });

  describe('questCancel', function() {
    var party, cancelSpy, windowSpy;
    beforeEach(function() {
      sandbox.stub(questsService, 'sendAction').returns({
        then: sandbox.stub().yields({members: {another: true}})
      });
    });

    it('calls Quests.sendAction when alert box is confirmed', function() {
      sandbox.stub(window, "confirm").returns(true);

      scope.questCancel();

      expect(window.confirm).to.be.calledOnce;
      expect(window.confirm).to.be.calledWith(window.env.t('sureCancel'));
      expect(questsService.sendAction).to.be.calledOnce;
      expect(questsService.sendAction).to.be.calledWith('questCancel');
    });

    it('does not call Quests.sendAction when alert box is not confirmed', function() {
      sandbox.stub(window, "confirm").returns(false);

      scope.questCancel();

      expect(window.confirm).to.be.calledOnce;
      expect(questsService.sendAction).to.not.be.called;
    });
  });

  describe('questAbort', function() {
    beforeEach(function() {
      sandbox.stub(questsService, 'sendAction').returns({
        then: sandbox.stub().yields({members: {another: true}})
      });
    });

    it('calls Quests.sendAction when two alert boxes are confirmed', function() {
      sandbox.stub(window, "confirm", function(){return true});

      scope.questAbort();
      expect(window.confirm).to.be.calledTwice;
      expect(window.confirm).to.be.calledWith(window.env.t('sureAbort'));
      expect(window.confirm).to.be.calledWith(window.env.t('doubleSureAbort'));

      expect(questsService.sendAction).to.be.calledOnce;
      expect(questsService.sendAction).to.be.calledWith('questAbort');
    });

    it('does not call Quests.sendAction when first alert box is not confirmed', function() {
      sandbox.stub(window, "confirm", function(){return false});

      scope.questAbort();

      expect(window.confirm).to.be.calledOnce;
      expect(window.confirm).to.be.calledWith(window.env.t('sureAbort'));
      expect(window.confirm).to.not.be.calledWith(window.env.t('doubleSureAbort'));

      expect(questsService.sendAction).to.not.be.called;
    });

    it('does not call Quests.sendAction when first alert box is confirmed but second one is not', function() {
      // Hack to confirm first window, but not second
      // Should not be necessary when we upgrade sinon
      var shouldReturn = false;
      sandbox.stub(window, 'confirm', function(){
        shouldReturn = !shouldReturn;
        return shouldReturn;
      });

      scope.questAbort();

      expect(window.confirm).to.be.calledTwice;
      expect(window.confirm).to.be.calledWith(window.env.t('sureAbort'));
      expect(window.confirm).to.be.calledWith(window.env.t('doubleSureAbort'));
      expect(questsService.sendAction).to.not.be.called;
    });
  });

  describe('#questLeave', function() {
    beforeEach(function() {
      scope.group = {
        quest: { members: { 'user-id': true } }
      };
      sandbox.stub(questsService, 'sendAction').returns({
        then: sandbox.stub().yields({members: {another: true}})
      });
    });

    it('calls Quests.sendAction when alert box is confirmed', function() {
      sandbox.stub(window, "confirm").returns(true);

      scope.questLeave();

      expect(window.confirm).to.be.calledOnce;
      expect(window.confirm).to.be.calledWith(window.env.t('sureLeave'));
      expect(questsService.sendAction).to.be.calledOnce;
      expect(questsService.sendAction).to.be.calledWith('questLeave');
    });

    it('does not call Quests.sendAction when alert box is not confirmed', function() {
      sandbox.stub(window, "confirm").returns(false);

      scope.questLeave();

      expect(window.confirm).to.be.calledOnce;
      questsService.sendAction.should.not.have.been.calledOnce;
    });

    it('updates quest object with new participants list', function() {
      scope.group.quest = {
        members: { user: true, another: true }
      };
      sandbox.stub(window, "confirm").returns(true);

      scope.questLeave();

      expect(scope.group.quest).to.eql({members: { another: true }});
    });
  });

  describe('clickStartQuest', function() {
    beforeEach(function() {
      sandbox.stub(rootScope, 'openModal');
      sandbox.stub(rootScope.$state, 'go');
    });

    it('opens quest modal if user has a quest', function() {
      user.items.quests = {
        whale: 1
      };

      scope.clickStartQuest();

      expect(rootScope.$state.go).to.not.be.called;
      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith(
        'ownedQuests',
        { controller: 'InventoryCtrl' }
      );
    });

    it('does not open modal if user has no quests', function() {
      user.items.quests = { };

      scope.clickStartQuest();

      expect(rootScope.openModal).to.not.be.called;
      expect(rootScope.$state.go).to.be.calledOnce;
      expect(rootScope.$state.go).to.be.calledWith('options.inventory.quests');
    });

    it('does not open modal if user had quests previously, but does not now', function() {
      user.items.quests = {
        whale: 0,
        atom1: 0
      };

      scope.clickStartQuest();

      expect(rootScope.openModal).to.not.be.called;
      expect(rootScope.$state.go).to.be.calledOnce;
      expect(rootScope.$state.go).to.be.calledWith('options.inventory.quests');
    });
  });

  describe('#leaveOldPartyAndJoinNewParty', function() {
    beforeEach(function() {
      sandbox.stub(scope, 'join');
      sandbox.stub(groups.Group, 'leave').yields();
      sandbox.stub(groups, 'party').returns({
        _id: 'old-party'
      });
      sandbox.stub(window, 'confirm').returns(true);
    });

    it('does nothing if user declines confirmation', function() {
      window.confirm.returns(false);
      scope.leaveOldPartyAndJoinNewParty('some-id', 'some-name');

      expect(groups.Group.leave).to.not.be.called;
    })

    it('leaves user\'s current party', function() {
      scope.leaveOldPartyAndJoinNewParty('some-id', 'some-name');

      expect(groups.Group.leave).to.be.calledOnce;
      expect(groups.Group.leave).to.be.calledWith({
        gid: 'old-party',
        keep: false
      });
    });

    it('joins the new party', function() {
      scope.leaveOldPartyAndJoinNewParty('some-id', 'some-name');

      expect(scope.join).to.be.calledOnce;
      expect(scope.join).to.be.calledWith({
        id: 'some-id',
        name: 'some-name'
      });
    });
  });

  describe('#canEditQuest', function() {
    var party;

    beforeEach(function() {
      party = specHelper.newGroup({
        type: 'party',
        leader: {},
        quest: {}
      });
    });

    it('returns false if user is not the quest leader', function() {
      party.quest.leader = 'another-user';

      expect(scope.canEditQuest(party)).to.eql(false);
    });

    it('returns true if user is quest leader', function() {
      party.quest.leader = 'unique-user-id';

      expect(scope.canEditQuest(party)).to.eql(true);
    });
  });
});
