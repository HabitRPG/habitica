'use strict';

describe('Tags Service', function() {
  var rootScope, tags, user, $httpBackend;
  var apiV3Prefix = 'api/v3/tags';

  beforeEach(function() {
    module(function($provide) {
      user = specHelper.newUser();
      $provide.value('User', {user: user});
    });

    inject(function(_$httpBackend_, _$rootScope_, Tags, User) {
      $httpBackend = _$httpBackend_;
      rootScope = _$rootScope_;
      tags = Tags;
    });
  });

  it('calls get tags endpoint', function() {
    $httpBackend.expectGET(apiV3Prefix).respond({});
    tags.getTags();
    $httpBackend.flush();
  });

  it('calls post tags endpoint', function() {
    $httpBackend.expectPOST(apiV3Prefix).respond({});
    tags.createTag();
    $httpBackend.flush();
  });

  it('calls get tag endpoint', function() {
    var tagId = 1;
    $httpBackend.expectGET(apiV3Prefix + '/' + tagId).respond({});
    tags.getTag(tagId);
    $httpBackend.flush();
  });

  it('calls update tag endpoint', function() {
    var tagId = 1;
    $httpBackend.expectPUT(apiV3Prefix + '/' + tagId).respond({});
    tags.updateTag(tagId, {});
    $httpBackend.flush();
  });

  it('calls delete tag endpoint', function() {
    var tagId = 1;
    $httpBackend.expectDELETE(apiV3Prefix + '/' + tagId).respond({});
    tags.deleteTag(tagId);
    $httpBackend.flush();
  });
});
