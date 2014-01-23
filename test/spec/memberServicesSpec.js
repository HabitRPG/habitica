'use strict';

describe('memberServices', function() {
  var $httpBackend, members;

  beforeEach(module('memberServices'));
  beforeEach(module('habitrpg'));
  
  beforeEach(inject(function (_$httpBackend_, Members) {
    $httpBackend = _$httpBackend_;
    members = Members;
  }));

  it('has no members at the beginning', function() {
    expect(members.members).to.be.an('object');
    expect(members.members).to.eql({});
    expect(members.selectedMember).to.be.undefined;
  });

  it('populates members', function(){
    var uid = 'abc';
    members.populate({
      members: [{ _id: uid }]
    });
    expect(members.members).to.eql({
      abc: { _id: uid }
    });
  });

  it('selects a member', function(){
    var uid = 'abc';
    $httpBackend.expectGET('/api/v2/members/' + uid).respond({ _id: uid });
    members.selectMember(uid);
    $httpBackend.flush();

    expect(members.selectedMember._id).to.eql(uid);
    expect(members.members).to.have.property(uid);
  });

});
