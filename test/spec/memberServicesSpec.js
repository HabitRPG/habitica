'use strict';

describe('memberServices', function() {
  var $httpBackend, members;

  beforeEach(module('memberServices'));
  beforeEach(module('habitrpg'));
  
  beforeEach(function(){
    inject(function(_$httpBackend_, $rootScope){
      $httpBackend = _$httpBackend_;
      $rootScope.Shared = window.habitrpgShared;
    });
    // $rootScope.Shared is set, so now we can inject Members
    inject(function(Members){
      members = Members;
    });
  });

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