beforeEach(module('habitrpg'));

var sandbox;
beforeEach(function() {
  sandbox = sinon.sandbox.create();
});

afterEach(function() {
  sandbox.restore();
});

var specHelper = {};

(function(){

  specHelper.newUser = newUser;
  specHelper.newGroup = newGroup;
  specHelper.newTask = newTask;
  specHelper.newHabit = newHabit;
  specHelper.newDaily = newDaily;
  specHelper.newTodo = newTodo;
  specHelper.newReward = newReward;

  function newUser() {
    var buffs = {per:0, int:0, con:0, str:0, stealth: 0, streaks: false};
    user = {
      auth:{timestamps: {}},
      stats: {str:1, con:1, per:1, int:1, mp: 32, class: 'warrior', buffs: buffs, gp: 0},
      items:{
        lastDrop:{count: 0},
        hatchingPotions: {},
        eggs: {},
        food: {},
        pets: {},
        mounts: {},
        gear: {equipped: {}, costume: {}, owned: {}},
      },
      party: {
        quest: {
          progress: {down: 0}
        }
      },
      preferences: {},
      dailys: [],
      todos: [],
      rewards: [],
      flags: {},
      filters: {},
      achievements: {},
    };
    return user;
  }

  function newGroup(leader) {
    var quest = { progress: { }, active: false };
    group = {
      "leader" : leader,
      "quest" : quest,
      "memberCount" : 1,
      "chat" : [],
      "privacy" : "public",
      "invites" : [],
      "members" : [
        leader
      ]
    };
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

    for(var key in overrides) {
      task[key] = overrides[key];
    }

    return task;
  }

  function newHabit(overrides) {
    var habit = newTask();
    habit.type = 'habit';
    habit.history = [];
    habit.up = true;
    habit.down = true;

    for(var key in overrides) {
      habit[key] = overrides[key];
    }

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

    for(var key in overrides) {
      daily[key] = overrides[key];
    }

    return daily;
  }

  function newTodo(overrides) {
    var todo = newTask();
    todo.type = 'todo';
    todo.completed = false;
    todo.collapseChecklist = false;
    todo.checklist = [];

    for(var key in overrides) {
      todo[key] = overrides[key];
    }

    return todo;
  }

  function newReward(overrides) {
    var reward = newTask();
    reward.type = 'reward';

    for(var key in overrides) {
      reward[key] = overrides[key];
    }

    return reward;
  }
})();
