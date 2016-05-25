'use strict';

describe('groupServices', function() {
  var $httpBackend, $http, groups, user;
  var groupApiUrlPrefix = '/api/v3/groups';

  beforeEach(function() {
    module(function($provide) {
      user = specHelper.newUser();
      user._id = "unique-user-id"
      user.party._id = 'unique-party-id';
      user.sync = function(){};
      $provide.value('User', {user: user});
    });

    inject(function(_$httpBackend_, Groups, User) {
      $httpBackend = _$httpBackend_;
      groups = Groups;
    });
  });

  it('calls get groups', function() {
    $httpBackend.expectGET(groupApiUrlPrefix).respond({});
    groups.Group.getGroups();
    $httpBackend.flush();
  });

  it('calls get group', function() {
    var gid = 1;
    $httpBackend.expectGET(groupApiUrlPrefix + '/' + gid).respond({});
    groups.Group.get(gid);
    $httpBackend.flush();
  });

  it('calls party endpoint', function() {
    var groupId = '1234';
    var groupResponse = {data: {_id: groupId}};
    $httpBackend.expectGET(groupApiUrlPrefix + '/party').respond(groupResponse);
    $httpBackend.expectGET('/api/v3/groups/' + groupId + '/members?includeAllPublicFields=true').respond({});
    $httpBackend.expectGET('/api/v3/groups/' + groupId + '/invites').respond({});
    $httpBackend.expectGET('/api/v3/challenges/groups/' + groupId).respond({});
    groups.Group.syncParty();
    $httpBackend.flush();
  });

  it('calls create endpoint', function() {
    $httpBackend.expectPOST(groupApiUrlPrefix).respond({});
    groups.Group.create({});
    $httpBackend.flush();
  });

  it('calls update group', function() {
    var gid = 1;
    var groupDetails = { _id: gid };
    $httpBackend.expectPUT(groupApiUrlPrefix + '/' + gid).respond({});
    groups.Group.update(groupDetails);
    $httpBackend.flush();
  });

  it('calls join group', function() {
    var gid = 1;
    $httpBackend.expectPOST(groupApiUrlPrefix + '/' + gid + '/join').respond({});
    groups.Group.join(gid);
    $httpBackend.flush();
  });

  it('calls reject invite group', function() {
    var gid = 1;
    $httpBackend.expectPOST(groupApiUrlPrefix + '/' + gid + '/reject-invite').respond({});
    groups.Group.rejectInvite(gid);
    $httpBackend.flush();
  });

  it('calls invite group', function() {
    var gid = 1;
    $httpBackend.expectPOST(groupApiUrlPrefix + '/' + gid + '/invite').respond({});
    groups.Group.invite(gid, [], []);
    $httpBackend.flush();
  });

  it('calls party endpoint when party is not cached', function() {
    var groupId = '1234';
    var groupResponse = {data: {_id: groupId}};
    $httpBackend.expectGET(groupApiUrlPrefix + '/party').respond(groupResponse);
    $httpBackend.expectGET('/api/v3/groups/' + groupId + '/members?includeAllPublicFields=true').respond({});
    $httpBackend.expectGET('/api/v3/groups/' + groupId + '/invites').respond({});
    $httpBackend.expectGET('/api/v3/challenges/groups/' + groupId).respond({});
    groups.party();
    $httpBackend.flush();
  });

  it('returns party if cached', function (done) {
    var uid = 'abc';
    var party = {
      _id: uid,
    };
    groups.data.party = party;
    groups.party()
      .then(function (result) {
        expect(result).to.eql(party);
        done();
      });
    $httpBackend.flush();
  });

  it('calls tavern endpoint when tavern is not cached', function() {
    $httpBackend.expectGET(groupApiUrlPrefix + '/habitrpg').respond({});
    groups.tavern();
    $httpBackend.flush();
  });

  it('returns tavern if cached', function (done) {
    var uid = 'abc';
    var tavern = {
      _id: uid,
    };
    groups.data.tavern = tavern;
    groups.tavern()
      .then(function (result) {
        expect(result).to.eql(tavern);
        done();
      });
    $httpBackend.flush();
  });

  it('calls public guilds endpoint', function() {
    $httpBackend.expectGET(groupApiUrlPrefix + '?type=publicGuilds').respond([]);
    groups.publicGuilds();
    $httpBackend.flush();
  });

  it('returns public guilds if cached', function (done) {
    var uid = 'abc';
    var publicGuilds = [
      {_id: uid},
    ];
    groups.data.publicGuilds = publicGuilds;

    groups.publicGuilds()
      .then(function (result) {
        expect(result).to.eql(publicGuilds);
        done();
      });

    $httpBackend.flush();
  });

  it('calls my guilds endpoint', function() {
    $httpBackend.expectGET(groupApiUrlPrefix + '?type=guilds').respond([]);
    groups.myGuilds();
    $httpBackend.flush();
  });

  it('returns my guilds if cached', function (done) {
    var uid = 'abc';
    var myGuilds = [
      {_id: uid},
    ];
    groups.data.myGuilds = myGuilds;

    groups.myGuilds()
      .then(function (myGuilds) {
        expect(myGuilds).to.eql(myGuilds);
        done();
      });

    $httpBackend.flush()
  });
});
