'use strict';

describe('groupServices', function() {
  var $httpBackend, $http, groups, user;
  var groupApiUrlPrefix = '/api/v3/groups';

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
    $httpBackend.expectGET(groupApiUrlPrefix + '/party').respond({});
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
    $httpBackend.expectPUT(groupApiUrlPrefix + '/' + gid).respond({});
    groups.Group.update(gid, {});
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

  xit('calls tavern endpoint', function() {
    $httpBackend.expectGET(groupApiUrlPrefix + '/habitrpg').respond({});
    groups.tavern();
    $httpBackend.flush();
  });

  xit('calls public guilds endpoint', function() {
    $httpBackend.expectGET(groupApiUrlPrefix + '?type=public').respond([]);
    groups.publicGuilds();
    $httpBackend.flush();
  });

  xit('calls my guilds endpoint', function() {
    $httpBackend.expectGET(groupApiUrlPrefix + '?type=guilds').respond([]);
    groups.myGuilds();
    $httpBackend.flush();
  });

  xit('calls join endpoint', function() {
    $httpBackend.expectPOST(groupApiUrlPrefix + '/1/join').respond([]);
    groups.Group.join({gid: 1});
    $httpBackend.flush();
  });
});
