'use strict';

describe('Challenges Controller', function() {
  var rootScope, scope, user, User, ctrl, groups, members, notification, state;

  beforeEach(function() {
    module(function($provide) {
      user = specHelper.newUser();
      User = {
        getBalanceInGems: sandbox.stub(),
        sync: sandbox.stub(),
        user: user
      }
      $provide.value('User', User);
    });

    inject(function($rootScope, $controller, _$state_, _Groups_, _Members_, _Notification_){
      scope = $rootScope.$new();
      rootScope = $rootScope;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: User});

      ctrl = $controller('ChallengesCtrl', {$scope: scope, User: User});

      groups = _Groups_;
      members = _Members_;
      notification = _Notification_;
      state = _$state_;
    });
  });

  context('filtering', function() {
    describe('filterChallenges', function() {
      var ownMem, ownNotMem, notOwnMem, notOwnNotMem;

      beforeEach(function() {
        ownMem = specHelper.newChallenge({
          description: 'You are the owner and member',
          leader: user._id,
          members: [user],
          _isMember: true
        });

        ownNotMem = specHelper.newChallenge({
          description: 'You are the owner, but not a member',
          leader: user._id,
          members: [],
          _isMember: false
        });

        notOwnMem = specHelper.newChallenge({
          description: 'Not owner but a member',
          leader: {_id:"test"},
          members: [user],
          _isMember: true
        });

        notOwnNotMem = specHelper.newChallenge({
          description: 'Not owner or member',
          leader: {_id:"test"},
          members: [],
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

    describe('selectAll', function() {
      it('sets all groups in seach.group to true', function() {
        scope.search = { };
        scope.groups = {
          0: specHelper.newGroup({_id: 'group-one'}),
          1: specHelper.newGroup({_id: 'group-two'}),
          2: specHelper.newGroup({_id: 'group-three'})
        };
        scope.selectAll();

        expect(scope.search.group).to.eql({
          'group-one': true,
          'group-two': true,
          'group-three': true
        });
      });
    });

    describe('selectNone', function() {
      it('sets all groups in seach.group to false', function() {
        scope.search = { };
        scope.groups = {
          0: specHelper.newGroup({_id: 'group-one'}),
          1: specHelper.newGroup({_id: 'group-two'}),
          2: specHelper.newGroup({_id: 'group-three'})
        };
        scope.selectNone();

        expect(scope.search.group).to.eql({
          'group-one': false,
          'group-two': false,
          'group-three': false
        });
      });
    });
  });

  context('task manipulation', function() {

    describe('shouldShow', function() {
      it('overrides task controller function by always returning true', function() {
        expect(scope.shouldShow()).to.eq(true);
      });
    });

    describe('addTask', function() {
      it('adds default task to array', function() {
        var taskArray = [];
        var listDef = {
          newTask: 'new todo text',
          type: 'todo'
        }

        scope.addTask(taskArray, listDef);

        expect(taskArray.length).to.eql(1);
        expect(taskArray[0].text).to.eql('new todo text');
        expect(taskArray[0].type).to.eql('todo');
      });

      it('adds the task to the front of the array', function() {
        var previousTask = specHelper.newTodo({ text: 'previous task' });
        var taskArray = [previousTask];
        var listDef = {
          newTask: 'new todo',
          type: 'todo'
        }

        scope.addTask(taskArray, listDef);

        expect(taskArray.length).to.eql(2);
        expect(taskArray[0].text).to.eql('new todo');
        expect(taskArray[1].text).to.eql('previous task');
      });

      it('removes text from new task input box', function() {
        var taskArray = [];
        var listDef = {
          newTask: 'new todo text',
          type: 'todo'
        }

        scope.addTask(taskArray, listDef);

        expect(listDef.newTask).to.not.exist;
      });
    });

    describe('editTask', function() {
      it('is Tasks.editTask', function() {
        inject(function(Tasks) {
          expect(scope.editTask).to.eql(Tasks.editTask);
        });
      });
    });

    describe('removeTask', function() {
      var task, list;

      beforeEach(function() {
        sandbox.stub(window, 'confirm');
        task = specHelper.newTodo();
        list = [task];
      });

      it('asks user to confirm deletion', function() {
        scope.removeTask(task, list);
        expect(window.confirm).to.be.calledOnce;
      });

      it('does not remove task from list if not confirmed', function() {
        window.confirm.returns(false);
        scope.removeTask(task, list);

        expect(list).to.include(task);
      });

      it('removes task from list', function() {
        window.confirm.returns(true);
        scope.removeTask(task, list);

        expect(list).to.not.include(task);
      });
    });

    describe('saveTask', function() {
      it('sets task._editing to false', function() {
        var task = specHelper.newTask({ _editing: true });

        scope.saveTask(task);

        expect(task._editing).to.be.eql(false);
      });
    });
  });

  context('challenge owner interactions', function() {
    describe("save challenge", function() {
      var alert;

      beforeEach(function(){
        alert = sandbox.stub(window, "alert");
      });

      it("opens an alert box if challenge.group is not specified", function()
        {
        var challenge = specHelper.newChallenge({
          name: 'Challenge without a group',
          group: null
        });

        scope.save(challenge);

        expect(alert).to.be.calledOnce;
        expect(alert).to.be.calledWith(window.env.t('selectGroup'));
      });

      it("opens an alert box if isNew and user does not have enough gems", function() {
        var challenge = specHelper.newChallenge({
          name: 'Challenge without enough gems',
          prize: 5
        });

        scope.maxPrize = 4;
        scope.save(challenge);

        expect(alert).to.be.calledOnce;
        expect(alert).to.be.calledWith(window.env.t('challengeNotEnoughGems'));
      });

      it("saves the challenge if user does not have enough gems, but the challenge is not new", function() {
        var challenge = specHelper.newChallenge({
          _id: 'challenge-has-id-so-its-not-new',
          name: 'Challenge without enough gems',
          prize: 5,
          $save: sandbox.spy() // stub $save
        });

        scope.maxPrize = 0;
        scope.save(challenge);

        expect(challenge.$save).to.be.calledOnce;
        expect(alert).to.not.be.called;
      });

      it("saves the challenge if user has enough gems and challenge is new", function() {
        var challenge = specHelper.newChallenge({
          name: 'Challenge without enough gems',
          prize: 5,
          $save: sandbox.spy() // stub $save
        });

        scope.maxPrize = 5;
        scope.save(challenge);

        expect(challenge.$save).to.be.calledOnce;
        expect(alert).to.not.be.called;
      });

      it('saves challenge and then proceeds to detail page', function() {
        var saveSpy = sandbox.stub();
        saveSpy.yields({_id: 'challenge-id'});
        sandbox.stub(state, 'transitionTo');

        var challenge = specHelper.newChallenge({
          $save: saveSpy // stub $save
        });

        scope.save(challenge);

        expect(state.transitionTo).to.be.calledOnce;
        expect(state.transitionTo).to.be.calledWith(
         'options.social.challenges.detail',
         { cid: 'challenge-id' },
         {
            reload: true, inherit: false, notify: true
          }
        );
      });

      it('saves new challenge and syncs User', function() {
        var saveSpy = sandbox.stub();
        saveSpy.yields({_id: 'new-challenge'});

        var challenge = specHelper.newChallenge({
          $save: saveSpy // stub $save
        });

        scope.save(challenge);

        expect(User.sync).to.be.calledOnce;
      });

      it('saves new challenge and syncs User', function() {
        var saveSpy = sandbox.stub();
        saveSpy.yields({_id: 'new-challenge'});
        sinon.stub(notification, 'text');

        var challenge = specHelper.newChallenge({
          $save: saveSpy // stub $save
        });

        scope.save(challenge);

        expect(notification.text).to.be.calledOnce;
        expect(notification.text).to.be.calledWith(window.env.t('challengeCreated'));
      });
    });

    describe('create', function() {
      it('creates new challenge with group that user has selected in filter', function() {
        var party = specHelper.newGroup({
          type: 'party',
          _id: 'user-party'
        });
        scope.groupsFilter = [party];
        scope.search = {
          group: {
            'user-party': true
          }
        };

        scope.create();

        expect(scope.newChallenge.group).to.eql('user-party');
      });

      it('uses first group in $scope.groups if more than one exists', function() {
        var party = specHelper.newGroup({
          type: 'party',
          _id: 'user-party'
        });
        var guild = specHelper.newGroup({
          type: 'guild',
          _id: 'guild'
        });
        scope.groups = [party, guild];
        scope.groupsFilter = [party, guild];
        scope.search = {
          group: {
            'user-party': true,
            'guild': true
          }
        };

        scope.create();

        expect(scope.newChallenge.group).to.eql('user-party');
      });

      it('defaults to tavern if no group can be set as default', function() {
        scope.create();

        expect(scope.newChallenge.group).to.eql('habitrpg');
      });

      it('calculates maxPrize', function() {
        User.getBalanceInGems.returns(20);
        scope.create();

        expect(scope.maxPrize).to.eql(20);
      });

      it('sets newChallenge to a blank challenge', function() {
        scope.create();

        var chal = scope.newChallenge;

        expect(chal.name).to.eql('');
        expect(chal.description).to.eql('');
        expect(chal.habits).to.eql([]);
        expect(chal.dailys).to.eql([]);
        expect(chal.todos).to.eql([]);
        expect(chal.rewards).to.eql([]);
        expect(chal.leader).to.eql('unique-user-id');
        expect(chal.group).to.eql('habitrpg');
        expect(chal.timestamp).to.be.greaterThan(0);
        expect(chal.official).to.eql(false);
      });
    });

    describe('insufficientGemsForTavernChallenge', function() {
      context('tavern challenge', function() {
        it('returns true if user has no gems', function() {
          User.user.balance = 0;
          scope.newChallenge = specHelper.newChallenge({
            group: 'habitrpg'
          });

          var cannotCreateTavernChallenge = scope.insufficientGemsForTavernChallenge();
          expect(cannotCreateTavernChallenge).to.eql(true);
        });

        it('returns false if user has gems', function() {
          User.user.balance = .25;
          scope.newChallenge = specHelper.newChallenge({
            group: 'habitrpg'
          });

          var cannotCreateTavernChallenge = scope.insufficientGemsForTavernChallenge();
          expect(cannotCreateTavernChallenge).to.eql(false);
        });
      });

      context('non-tavern challenge', function() {
        it('returns false', function() {
          User.user.balance = 0;
          scope.newChallenge = specHelper.newChallenge({
            group: 'not-tavern'
          });

          var cannotCreateTavernChallenge = scope.insufficientGemsForTavernChallenge();
          expect(cannotCreateTavernChallenge).to.eql(false);
        });
      });
    });

    describe('edit', function() {
      it('transitions to edit page', function() {
        sandbox.stub(state, 'transitionTo');
        var challenge = specHelper.newChallenge({
          _id: 'challenge-id'
        });

        scope.edit(challenge);

        expect(state.transitionTo).to.be.calledOnce;
        expect(state.transitionTo).to.be.calledWith(
          'options.social.challenges.edit',
          { cid: challenge._id },
          { reload: true, inherit: false, notify: true }
        );
      });
    });

    describe('discard', function() {
      it('sets new challenge to null', function() {
        scope.newChallenge = specHelper.newChallenge();

        scope.discard();

        expect(scope.newChallenge).to.not.exist;
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

  context('User interactions', function() {
    describe('join', function() {
      it('calls challenge.$join', function(){
        var challenge = specHelper.newChallenge({
          _id: 'challenge-to-join',
          $join: sandbox.spy()
        });

        scope.join(challenge);

        expect(challenge.$join).to.be.calledOnce;
      });
    });

    describe('clickLeave', function() {
      var clickEvent = {
        target: 'button'
      };

      it('sets selectedChal to passed in challenge', function() {
        var challenge = specHelper.newChallenge({
          _id: 'popover-challenge-to-leave'
        });

        expect(scope.selectedChal).to.not.exist;

        scope.clickLeave(challenge, clickEvent);
        expect(scope.selectedChal).to.eql(challenge);
      });

      it('creates popover element', function() {
        var challenge = specHelper.newChallenge({
          _id: 'popover-challenge-to-leave'
        });

        expect(scope.popoverEl).to.not.exist;
        scope.clickLeave(challenge, clickEvent);
        expect(scope.popoverEl).to.exist;
      });
    });

    describe('leave', function() {
      var challenge = specHelper.newChallenge({
        _id: 'challenge-to-leave',
        $leave: sandbox.spy()
      });

      var clickEvent = {
        target: 'button'
      };

      it('removes selectedChal when cancel is chosen', function() {
        scope.clickLeave(challenge, clickEvent);

        expect(scope.selectedChal).to.eql(challenge);

        scope.leave('cancel');
        expect(scope.selectedChal).to.not.exist;
      });

      it('calls challenge.$leave when anything but cancel is chosen', function() {
        scope.clickLeave(challenge, clickEvent);

        scope.leave('not-cancel');
        expect(challenge.$leave).to.be.calledOnce;
      });
    });
  });

  context('modal actions', function() {
    beforeEach(function() {
      sandbox.stub(members, 'selectMember');
      sandbox.stub(rootScope, 'openModal');
    });

    describe('sendMessageToChallengeParticipant', function() {
      it('opens private-message modal', function() {
        members.selectMember.yields();
        scope.sendMessageToChallengeParticipant(user._id);

        expect(rootScope.openModal).to.be.calledOnce;
        expect(rootScope.openModal).to.be.calledWith(
          'private-message',
          { controller: 'MemberModalCtrl' }
        );
      });
    });

    describe('sendGiftToChallengeParticipant', function() {
      it('opens send-gift modal', function() {
        members.selectMember.yields();
        scope.sendGiftToChallengeParticipant(user._id);

        expect(rootScope.openModal).to.be.calledOnce;
        expect(rootScope.openModal).to.be.calledWith(
          'send-gift',
          { controller: 'MemberModalCtrl' }
        );
      });
    });
  });
});
