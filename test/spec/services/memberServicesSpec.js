'use strict';

describe('memberServices', function() {
  var $httpBackend, members;

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

  describe('addToMembersList', function() {
    it('adds member to members object', function() {
      var member = { _id: 'user_id' };
      members.addToMembersList(member);
      expect(members.members).to.eql({
        user_id: { _id: 'user_id' }
      });
    });
  });

  describe('selectMember', function() {
    it('fetches member if not already in cache', function() {
      var uid = 'abc';
      $httpBackend.expectGET('/api/v2/members/' + uid).respond({ _id: uid });
      members.selectMember(uid, function(){});
      $httpBackend.flush();

      expect(members.selectedMember._id).to.eql(uid);
      expect(members.members).to.have.property(uid);
    });

    it('fetches member if member data in cache is incomplete', function() {
      var uid = 'abc';
      members.members = {
        abc: { _id: 'abc', items: {} }
      }
      $httpBackend.expectGET('/api/v2/members/' + uid).respond({ _id: uid });
      members.selectMember(uid, function(){});
      $httpBackend.flush();

      expect(members.selectedMember._id).to.eql(uid);
      expect(members.members).to.have.property(uid);
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
