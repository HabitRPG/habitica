db.users.find(
  {$where: 'Array.isArray(this.items.pets) || Array.isArray(this.items.eggs) || Array.isArray(this.items.hatchingPotions)'},
  {backer: 1, items: 1}
).forEach(function (user) {
  if (_.isArray(user.items.pets)) {
    user.items.pets = _.reduce(user.items.pets, function (m, v) {
      m[v] = 5; return m;
    }, {});
  }

  if (!_.isString(user.items.currentPet)) {
    user.items.currentPet = user.items.currentPet ? user.items.currentPet.str : '';
  }

  if (_.isArray(user.items.eggs)) {
    user.items.eggs = _.reduce(user.items.eggs, function (m, v) {
      if (!m[v.name]) m[v.name] = 0;
      m[v.name]++;
      return m;
    }, {});
  }

  if (_.isArray(user.items.hatchingPotions)) {
    user.items.hatchingPotions = _.reduce(user.items.hatchingPotions, function (m, v) {
      if (!m[v]) m[v] = 0;
      m[v]++;
      return m;
    }, {});
  }

  user.items.food = {};
  user.items.mounts = {};
  user.items.currentMount = '';

  if (user.backer && user.backer.tier && user.backer.tier >= 90) {
    user.items.mounts['LionCub-Ethereal'] = true;
  }

  db.users.update({_id: user._id}, {$set: {items: user.items}});
});
