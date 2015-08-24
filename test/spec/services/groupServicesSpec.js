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
    var successPromise, failPromise;

    beforeEach(function() {
      sandbox.spy(user, 'sync');
      sandbox.stub(console, 'log');

      successPromise = sandbox.stub().returns({
        then: function(success, failure) {
          return success();
        }
      });

      failPromise = sandbox.stub().returns({
        then: function(success, failure) {
          return failure('fail');
        }
      });
    });

    var questFunctions = [
      'questAccept',
      'questReject',
      'questCancel',
      'questAbort',
      'questLeave'
    ];

    for (var i in questFunctions) {
      var questFunc = questFunctions[i];

      describe('#' + questFunc, function() {
        it('calls party.$' + questFunc, function() {
          var party = { };
          party['$' + questFunc] = successPromise;

          groups[questFunc](party);

          expect(party['$' + questFunc]).to.be.calledOnce;
        });

        it('syncs user if $' + questFunc + ' succeeds', function() {
          var successParty = { };
          successParty['$' + questFunc] = successPromise;

          groups[questFunc](successParty);

          user.sync.should.have.been.calledOnce;
        });

        it('does not sync user if $' + questFunc + ' fails', function() {
          var failParty = { };
          failParty['$' + questFunc] = failPromise;

          groups[questFunc](failParty);

          user.sync.should.not.have.been.calledOnce;
          console.log.should.have.been.calledWith('fail');
        });
      });
    }
  });
});
