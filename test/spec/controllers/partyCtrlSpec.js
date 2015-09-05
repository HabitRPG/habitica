'use strict';

describe("Party Controller", function() {
  var scope, ctrl, user, User, groups, $rootScope, $controller;

  beforeEach(function() {
    user = specHelper.newUser(),
    user._id = "unique-user-id";
    User = {
      user: user,
      sync: sinon.spy
    }

    module(function($provide) {
      $provide.value('User', User);
    });

    inject(function(_$rootScope_, _$controller_, Groups){

      $rootScope = _$rootScope_;

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
      var groupSpy = sinon.stub(groups, "questAccept", function(){return true;});
      scope.questAccept(party);
      groupSpy.should.have.been.calledOnce;
    });
  });

  describe('questReject', function() {
    it('calls Groups.questReject', function() {
      var party = {};
      var groupSpy = sinon.stub(groups, "questReject", function(){return true;});
      scope.questReject(party);
      groupSpy.should.have.been.calledOnce;
    });
  });

  describe('questCancel', function() {
    var party, cancelSpy, windowSpy;
    beforeEach(function() {
      party = {};
      cancelSpy = sinon.stub(groups, "questCancel", function(){return true;});
    });

    afterEach(function() {
      windowSpy.restore();
      cancelSpy.restore();
    });

    it('calls Groups.questCancel when alert box is confirmed', function() {
      windowSpy = sinon.stub(window, "confirm", function(){return true});

      scope.questCancel(party);
      windowSpy.should.have.been.calledOnce;
      windowSpy.should.have.been.calledWith(window.env.t('sureCancel'));
      cancelSpy.should.have.been.calledOnce;
    });

    it('does not call Groups.questCancel when alert box is confirmed', function() {
      windowSpy = sinon.stub(window, "confirm", function(){return false});

      scope.questCancel(party);
      windowSpy.should.have.been.calledOnce;
      cancelSpy.should.not.have.been.calledOnce;
    });
  });

  describe('questAbort', function() {
    var party, abortSpy, windowSpy;
    beforeEach(function() {
      party = {};
      abortSpy = sinon.stub(groups, "questAbort", function(){return true;});
    });

    afterEach(function() {
      windowSpy.restore();
      abortSpy.restore();
    });

    it('calls Groups.questAbort when two alert boxes are confirmed', function() {
      windowSpy = sinon.stub(window, "confirm", function(){return true});

      scope.questAbort(party);
      windowSpy.should.have.been.calledTwice;
      windowSpy.should.have.been.calledWith(window.env.t('sureAbort'));
      windowSpy.should.have.been.calledWith(window.env.t('doubleSureAbort'));
      abortSpy.should.have.been.calledOnce;
    });

    it('does not call Groups.questAbort when first alert box is not confirmed', function() {
      windowSpy = sinon.stub(window, "confirm", function(){return false});

      scope.questAbort(party);
      windowSpy.should.have.been.calledOnce;
      windowSpy.should.have.been.calledWith(window.env.t('sureAbort'));
      windowSpy.should.not.have.been.calledWith(window.env.t('doubleSureAbort'));
      abortSpy.should.not.have.been.calledOnce;
    });

    it('does not call Groups.questAbort when first alert box is confirmed but second one is not', function() {
      // Hack to confirm first window, but not second
      var shouldReturn = false;
      windowSpy = sinon.stub(window, "confirm", function(){
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
});
