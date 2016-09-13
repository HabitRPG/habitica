beforeEach(module('habitrpg'));

var specHelper = {};

(function(){

  specHelper.newUser = newUser;
  specHelper.newGroup = newGroup;
  specHelper.newTask = newTask;
  specHelper.newHabit = newHabit;
  specHelper.newDaily = newDaily;
  specHelper.newTodo = newTodo;
  specHelper.newReward = newReward;
  specHelper.newChallenge = newChallenge;

  function newUser(overrides) {
    var buffs = { per:0, int:0, con:0, str:0, stealth: 0, streaks: false };
    var stats = { str:1, con:1, per:1, int:1, mp: 32, class: 'warrior', buffs: buffs, gp: 0 };
    var items = {
      lastDrop: { count: 0 },
      hatchingPotions: {},
      eggs: {},
      food: {},
      pets: {},
      mounts: {},
      gear: { equipped: {}, costume: {}, owned: {} }
    };

    var user = {
      _id: 'unique-user-id',
      profile: {
        name: 'dummy-name',
      },
      auth: { timestamps: {} },
      stats: stats,
      items: items,
      party: {
        quest: {
          progress: {down: 0}
        }
      },
      preferences: { suppressModals: {} },
      habits: [],
      dailys: [],
      todos: [],
      rewards: [],
      flags: {},
      filters: {},
      achievements: {}
    };

    _setOverrides(user, overrides);

    return user;
  }

  function newGroup(overrides) {
    var quest = { progress: { }, active: false };
    var group = {
      _id: 'group-id',
      leader : 'leader-id',
      memberCount : 1,
      chat : [],
      privacy : "public",
      invites : [],
      members : [
        'leader-id'
      ]
    };

    _setOverrides(group, overrides);

    return group;
  }

  function newTask(overrides) {
    var task = {
      id: 'task-id',
      _id: 'task-id',
      dateCreated: Date.now,
      text: 'task text',
      notes: 'task notes',
      tags: { },
      value: 0,
      priority: 1,
      attribute: 'str',
      challenge: { }
    };

    _setOverrides(task, overrides);

    return task;
  }

  function newHabit(overrides) {
    var habit = newTask();
    habit.type = 'habit';
    habit.history = [];
    habit.up = true;
    habit.down = true;

    _setOverrides(habit, overrides);

    return habit;
  }

  function newDaily(overrides) {
    var daily = newTask();
    daily.type = 'daily';
    daily.frequency = 'weekly';
    daily.repeat = {
      m:  true,
      t:  true,
      w:  true,
      th: true,
      f:  true,
      s:  true,
      su: true
    };
    daily.startDate = Date.now;
    daily.history = [];
    daily.completed = false;
    daily.collapseChecklist = false;
    daily.checklist = [];
    daily.streak = 0;

    _setOverrides(daily, overrides);

    return daily;
  }

  function newTodo(overrides) {
    var todo = newTask();
    todo.type = 'todo';
    todo.completed = false;
    todo.collapseChecklist = false;
    todo.checklist = [];

    _setOverrides(todo, overrides);

    return todo;
  }

  function newReward(overrides) {
    var reward = newTask();
    reward.type = 'reward';

    _setOverrides(reward, overrides);

    return reward;
  }

  function newChallenge(overrides) {
    var challenge = {
      name: 'challenge name',
      description: 'challeng description',
      habits: [],
      dailys: [],
      todos: [],
      rewards: [],
      leader: 'leader-id',
      group: 'group-id',
      prize: 0,
      timestamp: +(new Date),
      members: ['leader-id'],
      official: false
    };

    _setOverrides(challenge, overrides);

    return challenge;
  }

  function _setOverrides(factory, overrides) {
    for(var key in overrides) {
      factory[key] = overrides[key];
    }
  }
})();
