beforeEach(module('habitrpg'));

specHelper = {
  newUser: function(){
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
        gear: {equipped: {}, costume: {}},
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
  },
  newGroup: function(leader) {
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
};

