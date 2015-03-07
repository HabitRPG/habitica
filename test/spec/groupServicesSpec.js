'use strict';

// @TODO the requests via $resource seem to be 
// doing a full page reload which breaks the specs 

xdescribe('groupServices', function() {
  var $httpBackend, groups;

  beforeEach(inject(function(_$httpBackend_, Groups) {
      $httpBackend = _$httpBackend_;
      groups = Groups;
  }));

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

});
