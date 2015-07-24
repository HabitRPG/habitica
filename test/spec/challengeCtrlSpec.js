'use strict';

describe('Challenges Controller', function() {
  var scope, ctrl, user, Challenges, $rootScope;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, _Challenges_){
      user = specHelper.newUser();
      user._id = "unique-user-id";

      scope = $rootScope.$new();

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('ChallengesCtrl', {$scope: scope, User: {user: user}});

      Challenges = _Challenges_;

    });
  });

  describe("enough gems tracking", function() {

    it("set enoughGems to false when user selects habitrpg without enough gems", function() {
      scope.newChallenge = new Challenges.Challenge({
        name: 'Challenge without a group',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: user._id,
        timestamp: +(new Date),
        members: [],
        official: false
      });
      scope.hasEnoughGemsToCreateChallenge('habitrpg');
      expect(scope.enoughGems).to.equal(false);
    });

    it("set enoughGems to true when user selects habitrpg with enough gems", function() {
      scope.newChallenge = new Challenges.Challenge({
        name: 'Challenge without a group',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: user._id,
        timestamp: +(new Date),
        members: [],
        official: false
      });
      user.balance = 1;
      scope.hasEnoughGemsToCreateChallenge('habitrpg');
      expect(scope.enoughGems).to.equal(true);
    });

  });

  describe("save challenge", function() {
    var alert;

    before(function(){
      alert = sinon.stub(window, "alert");
    });

    after(function(){
      window.alert.restore();
    });

    it("opens an alert box if challenge.group is habitrpg and user does not have enough gems", function() {
      scope.create();
      scope.newChallenge.group = "habitrpg";
      scope.save(scope.newChallenge);
      alert.should.have.been.calledWith(window.env.t('challengeNotEnoughGems'));
    });

    it("saves the challenge if challenge.group is habitrpg and user has enough gems", function() {
      var saveWasCalled = false;

      var challenge = new Challenges.Challenge({
        name: 'Challenge without enough gems',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: user._id,
        group: "habitrpg",
        timestamp: +(new Date),
        members: [],
        official: false,
        // Mock $save
        $save: function() {
          saveWasCalled = true;
          return;
        }
      });
      user.balance = 1;
      scope.newChallenge = challenge;
      scope.save(challenge);

      // Not the best test, but :shrug:
      expect(saveWasCalled).to.be.ok;
    });

    it("opens an alert box if challenge.group is not specified", function() {
      var challenge = new Challenges.Challenge({
        name: 'Challenge without a group',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: user._id,
        timestamp: +(new Date),
        members: [],
        official: false
      });

      scope.save(challenge);

      alert.should.have.been.calledWith(window.env.t('selectGroup'));
    });

    it("opens an alert box if isNew and user does not have enough gems", function() {
      var challenge = new Challenges.Challenge({
        name: 'Challenge without enough gems',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: user._id,
        group: "a-group-id",
        timestamp: +(new Date),
        members: [],
        official: false
      });

      scope.enoughGems = false;
      scope.save(challenge);

      alert.should.have.been.calledWith(window.env.t('challengeNotEnoughGems'));
    });

    it("saves the challenge if user does not have enough gems, but the challenge is not new", function() {
      var saveWasCalled = false;

      var challenge = new Challenges.Challenge({
        _id: 'challeng-id',
        name: 'Challenge without enough gems',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: user._id,
        group: "a-group-id",
        timestamp: +(new Date),
        members: [],
        official: false,
        // Mock $save
        $save: function(cb) {
          saveWasCalled = true;
          return;
        }
      });

      scope.save(challenge);

      expect(saveWasCalled).to.be.ok;
    });

    it("saves the challenge if user has enough gems and challenge is new", function() {
      var saveWasCalled = false;

      var challenge = new Challenges.Challenge({
        name: 'Challenge without enough gems',
        description: '',
        habits: [],
        dailys: [],
        todos: [],
        rewards: [],
        leader: user._id,
        group: "a-group-id",
        timestamp: +(new Date),
        members: [],
        official: false,
        // Mock $save
        $save: function() {
          saveWasCalled = true;
          return;
        }
      });

      scope.enoughGems = true;
      scope.save(challenge);

      // Not the best test, but :shrug:
      expect(saveWasCalled).to.be.ok;
    });
  });
});
