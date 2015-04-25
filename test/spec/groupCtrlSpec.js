'use strict';

describe('Groups Controller', function() {
  var scope, ctrl, groups, user, guild, party, $rootScope;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, Groups){
      user = specHelper.newUser();
      user._id = "unique-user-id";

      scope = $rootScope.$new();

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('GroupsCtrl', {$scope: scope, User: {user: user}});

      groups = Groups;
    });
  });

  it("isMemberOfGroup returns true if group is the user's party", function() {
    party = specHelper.newGroup("test-party");
    party._id = "unique-party-id";
    party.type = 'party';
    party.members = []; // Ensure we wouldn't pass automatically.

    var partyStub = sinon.stub(groups,"party", function() {
      return party;
    });

    expect(scope.isMemberOfGroup(user._id, party)).to.be.ok;
  });

  it('isMemberOfGroup returns true if guild is included in myGuilds call', function(){

    guild = specHelper.newGroup("leaders-user-id");
    guild._id = "unique-guild-id";
    guild.type = 'guild';
    guild.members.push(user._id);

    var myGuilds = sinon.stub(groups,"myGuilds", function() {
      return [guild];
    });

    expect(scope.isMemberOfGroup(user._id, guild)).to.be.ok;
    expect(myGuilds).to.be.called
  });

  it('isMemberOfGroup does not return true if guild is not included in myGuilds call', function(){

    guild = specHelper.newGroup("leaders-user-id");
    guild._id = "unique-guild-id";
    guild.type = 'guild';

    var myGuilds = sinon.stub(groups,"myGuilds", function() {
      return [];
    });

    expect(scope.isMemberOfGroup(user._id, guild)).to.not.be.ok;
    expect(myGuilds).to.be.called
  });
});

describe("Autocomplete controller", function() {
  var $scope, controller;

  beforeEach(inject(function($controller) {
    $scope = {query: undefined, $watch: function(task,fn) {}}; // mock watch & t function
    controller = $controller('AutocompleteCtrl', {$scope: $scope});
  }));

  it('filtering with undefined query (not loaded yet) defaults to true', function() {
      expect($scope.filterUser({user: "boo"})).to.be.ok
  })

  it('filtering with null query (no typing yet) defaults to true', function() {
    $scope.query = null
    expect($scope.filterUser({user: "boo"})).to.be.ok
  })

  it('filtering with prefix element will return true', function() {
    $scope.query = {text: "pre"}
    expect($scope.filterUser({user: "prefix"})).to.be.ok
  })

  it('filtering with nonprefix element will return false', function() {
    $scope.query = {text: "noprefix"}
    expect($scope.filterUser({user: "prefix"})).to.not.be.ok
  })
});