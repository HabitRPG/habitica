db.users.find({},{backer: 1, items:1}).forEach(function(user){
  user.items = {
    armor: +user.items.armor || 0,
    weapon: +user.items.weapon || 0,
    head: +user.items.head || 0,
    shield: +user.items.shield || 0,

    pets: _.reduce(user.items.pets, function(m,v){ m[v] = 5; return m;}, {}),
    currentPet: user.items.currentPet ? user.items.currentPet.str : '',
    eggs: _.reduce(user.items.eggs, function(m,v){
      if (!m[v.name]) m[v.name] = 0;
      m[v.name]++;
      return m;
    }, {}),

    hatchingPotions: _.reduce(user.items.hatchingPotions, function(m,v){
      if (!m[v]) m[v] = 0;
      m[v]++;
      return m;
    }, {}),

    food: {},

    mounts: {},
    currentMount: '',

    lastDrop: user.items.lastDrop || {date: new Date(), count: 0}
  };
  if (user.backer && user.backer.tier && user.backer.tier >= 90) {
    user.items.mounts['LionCub-Ethereal'] = true;
  }

  db.users.update({_id:user._id}, {$set:{items:user.items}});
});
