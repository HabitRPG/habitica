let query = {
  $or: [
    {'items.gear.owned.weapon_special_0': true},
    {'items.gear.owned.armor_special_0': true},
    {'items.gear.owned.head_special_0': true},
    {'items.gear.owned.shield_special_0': true},
  ],
};

db.users.find(query, {'items.gear.owned': 1, backer: 1}).forEach(function (user) {
  let owned = user.items.gear.owned;
  let tier = user.backer && user.backer.tier || 0;
  if (tier < 70) delete owned.weapon_special_0;
  if (tier < 45) delete owned.armor_special_0;
  if (tier < 45) delete owned.head_special_0;
  if (tier < 45) delete owned.shield_special_0;


  db.users.update({_id: user._id}, {$set: {'items.gear.owned': owned}});
});
