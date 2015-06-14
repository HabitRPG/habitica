'use strict';

describe('Filters Controller', function() {
  var scope, user;

  beforeEach(inject(function($rootScope, $controller, Shared) {
    user = specHelper.newUser();
    Shared.wrap(user);
    scope = $rootScope.$new();
    $controller('FiltersCtrl', {$scope: scope, User: {user: user}});
  }));

  describe('tags', function(){
    it('creates a tag', function(){
      scope._newTag = {name:'tagName'}
      scope.createTag();
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
    }));
  });

  describe('updateTaskFilter', function(){
    it('updatest user\'s filter query with the value of filterQuery', function () {
      scope.filterQuery = 'task';
      scope.updateTaskFilter();

      expect(user.filterQuery).to.eql(scope.filterQuery);
    });
  });
});
