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

  describe('filterChallenges', function() {
    var ownMem, ownNotMem, notOwnMem, notOwnNotMem;

    beforeEach(function() {
      ownMem = new challenges.Challenge({
        name: 'test',
        description: 'You are the owner and member',
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

      ownNotMem = new challenges.Challenge({
        name: 'test',
        description: 'You are the owner, but not a member',
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

      notOwnMem = new challenges.Challenge({
        name: 'test',
        description: 'Not owner but a member',
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

      notOwnNotMem = new challenges.Challenge({
        name: 'test',
        description: 'Not owner or member',
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
    });

    it('displays challenges that match membership: either and owner: either', function() {
      scope.search._isMember = 'either';
      scope.search._isOwner = 'either';
      expect(scope.filterChallenges(ownMem)).to.eql(true);
      expect(scope.filterChallenges(ownNotMem)).to.eql(true);
      expect(scope.filterChallenges(notOwnMem)).to.eql(true);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(true);
    });

    it('displays challenges that match membership: either and owner: true', function() {
      scope.search._isMember = 'either';
      scope.search._isOwner = true;
      expect(scope.filterChallenges(ownMem)).to.eql(true);
      expect(scope.filterChallenges(ownNotMem)).to.eql(true);
      expect(scope.filterChallenges(notOwnMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
    });

    it('displays challenges that match membership: either and owner: false', function() {
      scope.search._isMember = 'either';
      scope.search._isOwner = false;
      expect(scope.filterChallenges(ownMem)).to.eql(false);
      expect(scope.filterChallenges(ownNotMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnMem)).to.eql(true);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(true);
    });

    it('displays challenges that match membership: true and owner: either', function() {
      scope.search._isMember = true;
      scope.search._isOwner = 'either';
      expect(scope.filterChallenges(ownMem)).to.eql(true);
      expect(scope.filterChallenges(ownNotMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnMem)).to.eql(true);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
    });

    it('displays challenges that match membership: true and owner: true', function() {
      scope.search._isMember = true;
      scope.search._isOwner = true;
      expect(scope.filterChallenges(ownMem)).to.eql(true);
      expect(scope.filterChallenges(ownNotMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
    });

    it('displays challenges that match membership: true and owner: false', function() {
      scope.search._isMember = true;
      scope.search._isOwner = false;
      expect(scope.filterChallenges(ownMem)).to.eql(false);
      expect(scope.filterChallenges(ownNotMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnMem)).to.eql(true);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
    });

    it('displays challenges that match membership: false and owner: either', function() {
      scope.search._isMember = false;
      scope.search._isOwner = 'either';
      expect(scope.filterChallenges(ownMem)).to.eql(false);
      expect(scope.filterChallenges(ownNotMem)).to.eql(true);
      expect(scope.filterChallenges(notOwnMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(true);
    });

    it('displays challenges that match membership: false and owner: true', function() {
      scope.search._isMember = false;
      scope.search._isOwner = true;
      expect(scope.filterChallenges(ownMem)).to.eql(false);
      expect(scope.filterChallenges(ownNotMem)).to.eql(true);
      expect(scope.filterChallenges(notOwnMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(false);
    });

    it('displays challenges that match membership: false and owner: false', function() {
      scope.search._isMember = false;
      scope.search._isOwner = false;
      expect(scope.filterChallenges(ownMem)).to.eql(false);
      expect(scope.filterChallenges(ownNotMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnMem)).to.eql(false);
      expect(scope.filterChallenges(notOwnNotMem)).to.eql(true);
    });
  });

  describe('editTask', function() {
    it('is Tasks.editTask', function() {
      inject(function(Tasks) {
        expect(scope.editTask).to.eql(Tasks.editTask);
      });
    });
  });

  describe('clone', function() {
    it('Clones a challenge', function() {

      var copyChallenge = new challenges.Challenge({
        name: 'copyChallenge',
        description: 'copyChallenge',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: user._id,
        group: "copyGroup",
        timestamp: +(new Date),
        members: [user],
        official: true,
        _isMember: true,
        prize: 1
      });

      copyChallenge.habits = [
        {
          _id: "ae2aa6fd-fae4-44bc-940f-11976ee202f3",
          id: "ae2aa6fd-fae4-44bc-940f-11976ee202f3",
          dateCreated: "2015-06-15T00:18:59.440Z",
          down: true,
          notes: "",
          priority: 1,
          text: "test",
          type: "habit",
          up: true,
          value: 0,
        }
      ];
      scope.clone(copyChallenge)

      expect( scope.newChallenge.name ).to.eql( copyChallenge.name );
      expect( scope.newChallenge.description ).to.eql( copyChallenge.description );
      
      for( var property in copyChallenge.habits[0] ) {
        if ( property == "_id" || property == "id" ) {
          expect( scope.newChallenge.habits[0][property] ).to.not.eql( copyChallenge.habits[0][property] );
        } else {
          expect( scope.newChallenge.habits[0][property] ).to.eql( copyChallenge.habits[0][property] );
        }
      }
      expect( scope.newChallenge.dailys ).to.eql( copyChallenge.dailys );
      expect( scope.newChallenge.todos ).to.eql( copyChallenge.todos );
      expect( scope.newChallenge.rewards ).to.eql( copyChallenge.rewards );
      expect( scope.newChallenge.leader ).to.eql( copyChallenge.leader );
      expect( scope.newChallenge.timestamp ).to.not.eql( copyChallenge.timestamp );
      expect( scope.newChallenge.members ).to.eql( [] );
      expect( scope.newChallenge.official ).to.eql( copyChallenge.official );
      expect( scope.newChallenge.prize ).to.eql( copyChallenge.prize );

    });

  });

});
