'use strict';

describe("Party Controller", function() {
  var scope, ctrl, user, User, questsService, groups, rootScope, $controller;
  var party;

  beforeEach(function() {
    user = specHelper.newUser(),
    user._id = "unique-user-id";
    User = {
      user: user,
      sync: sandbox.spy(),
      set: sandbox.spy()
    };

    party = specHelper.newGroup({
      _id: "unique-party-id",
      type: 'party',
      members: ['leader-id'] // Ensure we wouldn't pass automatically.
    });

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

  describe('initialization', function() {
    function initializeControllerWithStubbedState() {
      inject(function(_$state_) {
        var state = _$state_;
        sandbox.stub(state, 'is').returns(true);
        $controller('PartyCtrl', { $scope: scope, $state: state });
        expect(state.is).to.be.calledOnce; // ensure initialization worked as desired
      });
    };

    beforeEach(function() {
      sandbox.stub(rootScope, 'openModal');
    });

    context('party has 1 member', function() {
      it('awards no new achievements', function() {
        sandbox.stub(groups, 'party').returns({
          $syncParty: function() {},
          memberCount: 1
        });

        initializeControllerWithStubbedState();

        expect(User.set).to.not.be.called;
        expect(rootScope.openModal).to.not.be.called;
      });
    });

    context('party has 2 members', function() {
      context('user does not have "Party Up" achievement', function() {
        it('awards "Party Up" achievement', function() {
          sandbox.stub(groups, 'party').returns({
            $syncParty: function() {},
            memberCount: 2
          });

          initializeControllerWithStubbedState();

          expect(User.set).to.be.calledOnce;
          expect(User.set).to.be.calledWith(
            { 'achievements.partyUp': true }
          );
          expect(rootScope.openModal).to.be.calledOnce;
          expect(rootScope.openModal).to.be.calledWith('achievements/partyUp');
        });
      });
    });

    context('party has 4 members', function() {
      beforeEach(function() {
        sandbox.stub(groups, 'party').returns({
          $syncParty: function() {},
          memberCount: 4
        });
      });

      context('user has "Party Up" but not "Party On" achievement', function() {
        it('awards "Party On" achievement', function() {
          user.achievements.partyUp = true;

          initializeControllerWithStubbedState();

          expect(User.set).to.be.calledOnce;
          expect(User.set).to.be.calledWith(
            { 'achievements.partyOn': true }
          );
          expect(rootScope.openModal).to.be.calledOnce;
          expect(rootScope.openModal).to.be.calledWith('achievements/partyOn');
        });
      });

      context('user has neither "Party Up" nor "Party On" achievements', function() {
        it('awards "Party Up" and "Party On" achievements', function() {
          initializeControllerWithStubbedState();

          expect(User.set).to.be.calledTwice;
          expect(User.set).to.be.calledWith(
            { 'achievements.partyUp': true}
          );
          expect(User.set).to.be.calledWith(
            { 'achievements.partyOn': true}
          );
          expect(rootScope.openModal).to.be.calledTwice;
          expect(rootScope.openModal).to.be.calledWith('achievements/partyUp');
          expect(rootScope.openModal).to.be.calledWith('achievements/partyOn');
        });
      });

      context('user has both "Party Up" and "Party On" achievements', function() {
        it('awards no new achievements', function() {
          user.achievements.partyUp = true;
          user.achievements.partyOn = true;

          initializeControllerWithStubbedState();

          expect(User.set).to.not.be.called;
          expect(rootScope.openModal).to.not.be.called;
        });
      });
    });
  });

  describe("create", function() {
    var partyStub;

    beforeEach(function () {
      partyStub = sandbox.stub(groups.Group, "create", function() {
        return party;
      });
    });

    it("creates a new party", function() {
      var group = {
        type: 'party',
      };
      scope.create(group);
      expect(partyStub).to.be.calledOnce;
      //@TODO: Check user party  console.log(User.user.party.id)
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
