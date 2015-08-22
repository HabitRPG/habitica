'use strict';

describe('groupServices', function() {
  var $httpBackend, $http, groups, user;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {user:user});
    });

    inject(function(_$httpBackend_, Groups, User) {
      $httpBackend = _$httpBackend_;
      groups = Groups;
      user = User;
      user.sync = function(){};
    });
  });

  it('calls party endpoint', function() {
    $httpBackend.expectGET('/api/v2/groups/party').respond({});
    groups.party();
    $httpBackend.flush();
  });

  it('calls tavern endpoint', function() {
    $httpBackend.expectGET('/api/v2/groups/habitrpg').respond({});
    groups.tavern();
    $httpBackend.flush();
  });

  it('calls public guilds endpoint', function() {
    $httpBackend.expectGET('/api/v2/groups?type=public').respond([]);
    groups.publicGuilds();
    $httpBackend.flush();
  });

  it('calls my guilds endpoint', function() {
    $httpBackend.expectGET('/api/v2/groups?type=guilds').respond([]);
    groups.myGuilds();
    $httpBackend.flush();
  });

  context('quest function wrappers', function() {
    var successPromise = function() {
      return {
        then: function(success, failure) {
          success();
        }
      }
    }

    var successParty = {
      $questAccept: successPromise,
      $questReject: successPromise,
      $questCancel: successPromise,
      $questAbort:  successPromise
    }

    var failPromise = function() {
      return {
        then: function(success, failure) {
          failure('fail');
        }
      }
    }

    var failParty = {
      $questAccept: failPromise,
      $questReject: failPromise,
      $questCancel: failPromise,
      $questAbort:  failPromise
    }

    beforeEach(function() {
      sinon.spy(user, 'sync');
      sinon.stub(console, 'log', function(arg) { return true; });
    });

    afterEach(function() {
      user.sync.restore();
      console.log.restore();
    });

    describe('questAccept', function() {
      it('syncs user if $questAccept succeeds', function() {
        groups.questAccept(successParty);
        user.sync.should.have.been.calledOnce;
      });

      it('does not sync user if $questAccept fails', function() {
        groups.questAccept(failParty);
        user.sync.should.not.have.been.calledOnce;
        console.log.should.have.been.calledWith('fail');
      });
    });

    describe('questReject', function() {
      it('syncs user if $questReject succeeds', function() {
        groups.questReject(successParty);
        user.sync.should.have.been.calledOnce;
        console.log.should.not.have.been.called;
      });

      it('does not sync user if $questReject fails', function() {
        groups.questReject(failParty);
        user.sync.should.not.have.been.calledOnce;
        console.log.should.have.been.calledWith('fail');
      });
    });

    describe('questCancel', function() {
      it('syncs user if $questCancel succeeds', function() {
        groups.questCancel(successParty);
        user.sync.should.have.been.calledOnce;
        console.log.should.not.have.been.called;
      });

      it('does not sync user if $questCancel fails', function() {
        groups.questCancel(failParty);
        user.sync.should.not.have.been.calledOnce;
        console.log.should.have.been.calledWith('fail');
      });
    });

    describe('questAbort', function() {
      it('syncs user if $questAbort succeeds', function() {
        groups.questAbort(successParty);
        user.sync.should.have.been.calledOnce;
        console.log.should.not.have.been.called;
      });

      it('does not sync user if $questAbort fails', function() {
        groups.questAbort(failParty);
        user.sync.should.not.have.been.calledOnce;
        console.log.should.have.been.calledWith('fail');
      });
    });
  });
});
