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
      official: false,
      _isMember: true
    });
    scope.clone(copyChallenge)

    expect( scope.obj.name ).to.eql(copyChallenge.name );
    expect( scope.obj.description ).to.eql(copyChallenge.description );
    expect( scope.obj.habits ).to.eql(copyChallenge.habits );
    expect( scope.obj.dailys ).to.eql(copyChallenge.dailys );
    expect( scope.obj.todos ).to.eql(copyChallenge.todos );
    expect( scope.obj.rewards ).to.eql(copyChallenge.rewards );
    expect( scope.obj.leader ).to.eql(copyChallenge.leader );
    expect( scope.obj.official ).to.eql(copyChallenge.official );

  });

});
