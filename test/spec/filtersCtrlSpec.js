'use strict';

describe('Filters Controller', function() {
  var scope, user;

  beforeEach(module('habitrpg'));
  beforeEach(inject(function($rootScope, $controller, Shared) {
    user = specHelper.newUser();
    Shared.wrap(user);
    scope = $rootScope.$new();
    $controller('FiltersCtrl', {$scope: scope, User: {user: user}});
  }));

  it('creates a tag', function(){
    scope.createTag('tagName');
    expect(user.tags).to.have.length(1);
    expect(user.tags[0].name).to.eql('tagName');
    expect(user.tags[0]).to.have.property('id');
  });

  it('toggles tag filtering', inject(function(Shared){
    var tag = {id: Shared.uuid(), name: 'myTag'};
    scope.toggleFilter(tag);
    expect(user.filters[tag.id]).to.eql(true);
    scope.toggleFilter(tag);
    expect(user.filters[tag.id]).to.eql(false);
  }))
});
