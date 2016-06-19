'use strict';

describe('Filters Controller', function() {
  var scope, user, userService;

  beforeEach(function () {
    module(function($provide) {
      var mockWindow = {href: '', alert: sandbox.spy(), location: {search: '', pathname: '', href: ''}};

      $provide.value('$window', mockWindow);
    });

    inject(function($rootScope, $controller, Shared, User) {
      user = specHelper.newUser();
      Shared.wrap(user);
      scope = $rootScope.$new();
      // user.filters = {};
      User.setUser(user);
      User.user.filters = {};
      userService = User;
      $controller('FiltersCtrl', {$scope: scope, User: User});
    })
  });

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
      expect(userService.user.filters[tag.id]).to.eql(true);
      scope.toggleFilter(tag);
      expect(userService.user.filters[tag.id]).to.not.eql(true);
    }));
  });

  describe('updateTaskFilter', function(){
    it('updatest user\'s filter query with the value of filterQuery', function () {
      scope.filterQuery = 'task';
      scope.updateTaskFilter();

      expect(userService.user.filterQuery).to.eql(scope.filterQuery);
    });
  });
});
