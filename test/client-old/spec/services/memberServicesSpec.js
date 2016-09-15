'use strict';

describe('memberServices', function() {
  var $httpBackend, members;
  var apiV3Prefix = '/api/v3';

  beforeEach(inject(function (_$httpBackend_, Members) {
    $httpBackend = _$httpBackend_;
    members = Members;
  }));

   afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });


  it('has no members at the beginning', function() {
    expect(members.members).to.be.an('object');
    expect(members.members).to.eql({});
    expect(members.selectedMember).to.be.undefined;
  });

  it('calls fetch member', function() {
    var memberId = 1;
    var memberUrl = apiV3Prefix + '/members/' + memberId;
    $httpBackend.expectGET(memberUrl).respond({});
    members.fetchMember(memberId);
    $httpBackend.flush();
  });

  it('calls get group members', function() {
    var groupId = 1;
    var memberUrl = apiV3Prefix + '/groups/' + groupId + '/members';
    $httpBackend.expectGET(memberUrl).respond({});
    members.getGroupMembers(groupId);
    $httpBackend.flush();
  });

  it('calls get group invites', function() {
    var groupId = 1;
    var memberUrl = apiV3Prefix + '/groups/' + groupId + '/invites';
    $httpBackend.expectGET(memberUrl).respond({});
    members.getGroupInvites(groupId);
    $httpBackend.flush();
  });

  it('calls get challenge members', function() {
    var challengeId = 1;
    var memberUrl = apiV3Prefix + '/challenges/' + challengeId + '/members?includeAllMembers=true';
    $httpBackend.expectGET(memberUrl).respond({});
    members.getChallengeMembers(challengeId);
    $httpBackend.flush();
  });

  it('calls get challenge members progress', function() {
    var challengeId = 1;
    var memberId = 2;
    var memberUrl = apiV3Prefix + '/challenges/' + challengeId + '/members/' + memberId;
    $httpBackend.expectGET(memberUrl).respond({});
    members.getChallengeMemberProgress(challengeId, memberId);
    $httpBackend.flush();
  });

  describe('addToMembersList', function() {
    it('adds member to members object', function() {
      var member = { _id: 'user_id' };
      members.addToMembersList(member, members);
      expect(members.members).to.eql({
        user_id: { _id: 'user_id' }
      });
    });
  });

  describe('selectMember', function() {
    it('fetches member if not already in cache', function(done) {
      var uid = 'abc';
      var memberResponse = {
        data: {_id: uid},
      }
      $httpBackend.expectGET(apiV3Prefix + '/members/' + uid).respond(memberResponse);
      members.selectMember(uid)
        .then(function () {
          expect(members.selectedMember._id).to.eql(uid);
          expect(members.members).to.have.property(uid);
          done();
        });
      $httpBackend.flush();
    });

    it('fetches member if member data in cache is incomplete', function(done) {
      var uid = 'abc';
      members.members = {
        abc: { _id: 'abc', items: {} }
      }
      var memberResponse = {
        data: {_id: uid},
      }
      $httpBackend.expectGET(apiV3Prefix + '/members/' + uid).respond(memberResponse);
      members.selectMember(uid)
        .then(function () {
          expect(members.selectedMember._id).to.eql(uid);
          expect(members.members).to.have.property(uid);
          done();
        });
      $httpBackend.flush();
    });

    it('gets member from cache if member has a weapons object', function() {
      var uid = 'abc';
      members.members[uid] = { _id: uid, items: { weapon: {} } };
      members.selectMember(uid, function(){
        expect(members.selectedMember._id).to.eql(uid);
        expect(members.members).to.have.property(uid);
      });
    });
  });
});
