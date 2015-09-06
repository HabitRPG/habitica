'use strict';

describe("Party Controller", function() {
  var scope, ctrl, user, User, groups, rootScope, $controller;

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

    inject(function(_$rootScope_, _$controller_, Groups){

      rootScope = _$rootScope_;

      scope = _$rootScope_.$new();

      $controller = _$controller_;

      groups = Groups;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: User});

      ctrl = $controller('PartyCtrl', {$scope: scope, User: User});
    });
  });

  describe('questAccept', function() {
    it('calls Groups.questAccept', function() {
      var party = {};
      var groupSpy = sandbox.stub(groups, "questAccept", function(){return true;});
      scope.questAccept(party);
      groupSpy.should.have.been.calledOnce;
    });
  });

  describe('questReject', function() {
    it('calls Groups.questReject', function() {
      var party = {};
      var groupSpy = sandbox.stub(groups, "questReject", function(){return true;});
      scope.questReject(party);
      groupSpy.should.have.been.calledOnce;
    });
  });

  describe('questCancel', function() {
    var party, cancelSpy, windowSpy;
    beforeEach(function() {
      party = {};
      cancelSpy = sandbox.stub(groups, "questCancel", function(){return true;});
    });

    afterEach(function() {
      windowSpy.restore();
      cancelSpy.restore();
    });

    it('calls Groups.questCancel when alert box is confirmed', function() {
      windowSpy = sandbox.stub(window, "confirm", function(){return true});

      scope.questCancel(party);
      windowSpy.should.have.been.calledOnce;
      windowSpy.should.have.been.calledWith(window.env.t('sureCancel'));
      cancelSpy.should.have.been.calledOnce;
    });

    it('does not call Groups.questCancel when alert box is not confirmed', function() {
      windowSpy = sandbox.stub(window, "confirm", function(){return false});

      scope.questCancel(party);
      windowSpy.should.have.been.calledOnce;
      cancelSpy.should.not.have.been.calledOnce;
    });
  });

  describe('questAbort', function() {
    var party, abortSpy, windowSpy;
    beforeEach(function() {
      party = {};
      abortSpy = sandbox.stub(groups, "questAbort", function(){return true;});
    });

    afterEach(function() {
      windowSpy.restore();
      abortSpy.restore();
    });

    it('calls Groups.questAbort when two alert boxes are confirmed', function() {
      windowSpy = sandbox.stub(window, "confirm", function(){return true});

      scope.questAbort(party);
      windowSpy.should.have.been.calledTwice;
      windowSpy.should.have.been.calledWith(window.env.t('sureAbort'));
      windowSpy.should.have.been.calledWith(window.env.t('doubleSureAbort'));
      abortSpy.should.have.been.calledOnce;
    });

    it('does not call Groups.questAbort when first alert box is not confirmed', function() {
      windowSpy = sandbox.stub(window, "confirm", function(){return false});

      scope.questAbort(party);
      windowSpy.should.have.been.calledOnce;
      windowSpy.should.have.been.calledWith(window.env.t('sureAbort'));
      windowSpy.should.not.have.been.calledWith(window.env.t('doubleSureAbort'));
      abortSpy.should.not.have.been.calledOnce;
    });

    it('does not call Groups.questAbort when first alert box is confirmed but second one is not', function() {
      // Hack to confirm first window, but not second
      var shouldReturn = false;
      windowSpy = sandbox.stub(window, "confirm", function(){
        shouldReturn = !shouldReturn;
        return shouldReturn;
      });

      scope.questAbort(party);
      windowSpy.should.have.been.calledTwice;
      windowSpy.should.have.been.calledWith(window.env.t('sureAbort'));
      windowSpy.should.have.been.calledWith(window.env.t('doubleSureAbort'));
      abortSpy.should.not.have.been.calledOnce;
    });
  });

  describe('#questLeave', function() {
    var party, leaveSpy, windowSpy;

    beforeEach(function() {
      party = {};
      scope.group = {
        quest: { members: { 'user-id': true } }
      };
      leaveSpy = sandbox.stub(groups, 'questLeave').returns({
        then: sandbox.stub().yields()
      });
    });

    it('calls Groups.questLeave when alert box is confirmed', function() {
      windowSpy = sandbox.stub(window, "confirm").returns(true);

      scope.questLeave(party);
      windowSpy.should.have.been.calledOnce;
      windowSpy.should.have.been.calledWith(window.env.t('sureLeave'));
      leaveSpy.should.have.been.calledOnce;
    });

    it('does not call Groups.questLeave when alert box is not confirmed', function() {
      windowSpy = sandbox.stub(window, "confirm").returns(false);

      scope.questLeave(party);
      windowSpy.should.have.been.calledOnce;
      leaveSpy.should.not.have.been.calledOnce;
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
});
