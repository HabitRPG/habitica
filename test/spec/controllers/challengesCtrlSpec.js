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

    var challengeToClone = {
      name: 'copyChallenge',
      description: 'copyChallenge',
      habits: [specHelper.newHabit()],
      dailys: [specHelper.newDaily()],
      todos: [specHelper.newTodo()],
      rewards: [specHelper.newReward()],
      leader: 'unique-user-id',
      group: { _id: "copyGroup" },
      timestamp: new Date("October 13, 2014 11:13:00"),
      members: ['id', 'another-id'],
      official: true,
      _isMember: true,
      prize: 1
    };

    it('Clones the basic challenge info', function() {

      scope.clone(challengeToClone);

      expect(scope.newChallenge.name).to.eql(challengeToClone.name);
      expect(scope.newChallenge.shortName).to.eql(challengeToClone.shortName);
      expect(scope.newChallenge.description).to.eql(challengeToClone.description);
      expect(scope.newChallenge.leader).to.eql(user._id);
      expect(scope.newChallenge.group).to.eql(challengeToClone.group._id);
      expect(scope.newChallenge.official).to.eql(challengeToClone.official);
      expect(scope.newChallenge.prize).to.eql(challengeToClone.prize);
    });

    it('does not clone members', function() {
      scope.clone(challengeToClone);

      expect(scope.newChallenge.members).to.not.exist;
    });

    it('does not clone timestamp', function() {
      scope.clone(challengeToClone);

      expect(scope.newChallenge.timestamp).to.not.exist;
    });

    it('clones habits', function() {
      scope.clone(challengeToClone);

      expect(scope.newChallenge.habits.length).to.eql(challengeToClone.habits.length);
      expect(scope.newChallenge.habits[0].text).to.eql(challengeToClone.habits[0].text);
      expect(scope.newChallenge.habits[0].notes).to.eql(challengeToClone.habits[0].notes);
    });

    it('clones dailys', function() {
      scope.clone(challengeToClone);

      expect(scope.newChallenge.dailys.length).to.eql(challengeToClone.dailys.length);
      expect(scope.newChallenge.dailys[0].text).to.eql(challengeToClone.dailys[0].text);
      expect(scope.newChallenge.dailys[0].notes).to.eql(challengeToClone.dailys[0].notes);
    });

    it('clones todos', function() {
      scope.clone(challengeToClone);

      expect(scope.newChallenge.todos.length).to.eql(challengeToClone.todos.length);
      expect(scope.newChallenge.todos[0].text).to.eql(challengeToClone.todos[0].text);
      expect(scope.newChallenge.todos[0].notes).to.eql(challengeToClone.todos[0].notes);
    });

    it('clones rewards', function() {
      scope.clone(challengeToClone);

      expect(scope.newChallenge.rewards.length).to.eql(challengeToClone.rewards.length);
      expect(scope.newChallenge.rewards[0].text).to.eql(challengeToClone.rewards[0].text);
      expect(scope.newChallenge.rewards[0].notes).to.eql(challengeToClone.rewards[0].notes);
    });
  });
});
