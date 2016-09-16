'use strict';

describe('challengeServices', function() {
  var $httpBackend, $http, challenges, user;
  var apiV3Prefix = '/api/v3';

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {user:user});
    });

    inject(function(_$httpBackend_, Challenges, User) {
      $httpBackend = _$httpBackend_;
      challenges = Challenges;
      user = User;
      user.sync = function(){};
    });
  });

  it('calls create challenge endpoint', function() {
    $httpBackend.expectPOST(apiV3Prefix + '/challenges').respond({});
    challenges.createChallenge();
    $httpBackend.flush();
  });

  it('calls join challenge endpoint', function() {
    var challengeId = 1;
    $httpBackend.expectPOST(apiV3Prefix + '/challenges/' + challengeId + '/join').respond({});
    challenges.joinChallenge(challengeId);
    $httpBackend.flush();
  });

  it('calls leave challenge endpoint', function() {
    var challengeId = 1;
    $httpBackend.expectPOST(apiV3Prefix + '/challenges/' + challengeId + '/leave').respond({});
    challenges.leaveChallenge(challengeId);
    $httpBackend.flush();
  });

  it('calls get user challenges endpoint', function() {
    $httpBackend.expectGET(apiV3Prefix + '/challenges/user').respond({});
    challenges.getUserChallenges();
    $httpBackend.flush();
  });

  it('calls get group challenges endpoint', function() {
    var groupId = 1;
    $httpBackend.expectGET(apiV3Prefix + '/challenges/groups/' + groupId).respond({});
    challenges.getGroupChallenges(groupId);
    $httpBackend.flush();
  });

  it('calls get challenge endpoint', function() {
    var challengeId = 1;
    $httpBackend.expectGET(apiV3Prefix + '/challenges/' + challengeId).respond({});
    challenges.getChallenge(challengeId);
    $httpBackend.flush();
  });

  it('calls export challenge to csv endpoint', function() {
    var challengeId = 1;
    $httpBackend.expectGET(apiV3Prefix + '/challenges/' + challengeId + '/export/csv').respond({});
    challenges.exportChallengeCsv(challengeId);
    $httpBackend.flush();
  });

  it('calls update challenge endpoint', function() {
    var challengeId = 1;
    $httpBackend.expectPUT(apiV3Prefix + '/challenges/' + challengeId).respond({});
    challenges.updateChallenge(challengeId);
    $httpBackend.flush();
  });

  it('calls delete challenge endpoint', function() {
    var challengeId = 1;
    $httpBackend.expectDELETE(apiV3Prefix + '/challenges/' + challengeId).respond({});
    challenges.deleteChallenge(challengeId);
    $httpBackend.flush();
  });

  it('calls select challenge winner endpoint', function() {
    var challengeId = 1;
    var winnerId = 2;
    $httpBackend.expectPOST(apiV3Prefix + '/challenges/' + challengeId + '/selectWinner/' + winnerId).respond({});
    challenges.selectChallengeWinner(challengeId, winnerId);
    $httpBackend.flush();
  });
});
