'use strict';

describe('Filters Controller', function() {
  var scope, user;

  beforeEach(module('habitrpg'));
  beforeEach(inject(function($rootScope, $controller) {
    user = {filters: {}};
    window.habitrpgShared.wrap(user);
    scope = $rootScope.$new();
    $controller('FiltersCtrl', {$scope: scope, User: {user: user}});
  }));

  it('creates a tag', function(){
    scope.createTag('tagName');
    expect(user.tags).to.eql([{name: 'tagName'}]);
  });

  it('toggles tag filtering', function(){
    var tag = {id: window.habitrpgShared.uuid(), name: 'myTag'};
    scope.toggleFilter(tag);
    expect(user.filters[tag.id]).to.eql(true);
    scope.toggleFilter(tag);
    expect(user.filters[tag.id]).to.eql(false);
  })
});