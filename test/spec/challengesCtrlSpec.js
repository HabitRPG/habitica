'use strict';

describe('Challenges Controller', function() {
  var $rootScope, scope, user, ctrl, challenges, groups;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, Challenges, Groups){
      user = specHelper.newUser();
      user._id = "unique-user-id";

      scope = $rootScope.$new();

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('ChallengesCtrl', {$scope: scope, User: {user: user}});

      challenges = Challenges;

      groups = Groups;
    });
  });

  it('filters challenges', function() {

   //There are four types of challenges

   // You are the owner and a member
   var ownMem = new challenges.Challenge({
     name: 'test',
     description: 'test',
     habits: [],
     dailys: [],
     todos: [],
     rewards: [],
     leader: user._id,
     group: "test",
     timestamp: +(new Date),
     members: [user],
     official: false,
     _isMember: true
   });

   // You are the owner but not a member
   var ownNotMem = new challenges.Challenge({
     name: 'test',
     description: 'test',
     habits: [],
     dailys: [],
     todos: [],
     rewards: [],
     leader: user._id,
     group: "test",
     timestamp: +(new Date),
     members: [],
     official: false,
     _isMember: false
   });

   // You are not the owner but you are a member
   var notOwnMem = new challenges.Challenge({
     name: 'test',
     description: 'test',
     habits: [],
     dailys: [],
     todos: [],
     rewards: [],
     leader: {_id:"test"},
     group: "test",
     timestamp: +(new Date),
     members: [user],
     official: false,
     _isMember: true
   });

   // You are not the owner or a member
   var notOwnNotMem = new challenges.Challenge({
     name: 'test',
     description: 'test',
     habits: [],
     dailys: [],
     todos: [],
     rewards: [],
     leader: {_id:"test"},
     group: "test",
     timestamp: +(new Date),
     members: [],
     official: false,
     _isMember: false
   });

   scope.search = {
     group: _.transform(groups, function(m,g){m[g._id]=true;})
   };

   //Filter: Membership - either and Owner - either
   scope.search._isMember = undefined;
   scope.search._isOwner = undefined;
   expect( scope.filterChallenges(ownMem) ).to.eql(true);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(true);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(true);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(true);

   //Filter: Membership - either and Owner - true
   scope.search._isMember = undefined;
   scope.search._isOwner = true;
   expect( scope.filterChallenges(ownMem) ).to.eql(true);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(true);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(false);

   //Filter: Membership - either and Owner - false
   scope.search._isMember = undefined;
   scope.search._isOwner = false;
   expect( scope.filterChallenges(ownMem) ).to.eql(false);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(true);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(true);

   //Filter: Membership - true and Owner - either
   scope.search._isMember = true;
   scope.search._isOwner = undefined;
   expect( scope.filterChallenges(ownMem) ).to.eql(true);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(true);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(false);

   //Filter: Membership - true and Owner - true
   scope.search._isMember = true;
   scope.search._isOwner = true;
   expect( scope.filterChallenges(ownMem) ).to.eql(true);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(false);

   //Filter: Membership - true and Owner - false
   scope.search._isMember = true;
   scope.search._isOwner = false;
   expect( scope.filterChallenges(ownMem) ).to.eql(false);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(true);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(false);

   //Filter: Membership - false and Owner - either
   scope.search._isMember = false;
   scope.search._isOwner = undefined;
   expect( scope.filterChallenges(ownMem) ).to.eql(false);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(true);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(true);

   //Filter: Membership - false and Owner - true
   scope.search._isMember = false;
   scope.search._isOwner = true;
   expect( scope.filterChallenges(ownMem) ).to.eql(false);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(true);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(false);

   //Filter: Membership - false and Owner - false
   scope.search._isMember = false;
   scope.search._isOwner = false;
   expect( scope.filterChallenges(ownMem) ).to.eql(false);
   expect( scope.filterChallenges(ownNotMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnMem) ).to.eql(false);
   expect( scope.filterChallenges(notOwnNotMem) ).to.eql(true);

  });

});
