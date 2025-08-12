db.users.update(
  {'items.gear.owned.head_special_nye': {$ne: null}},
  {$set: {'items.gear.owned.head_special_nye2014': false}},
  {multi: 1}
);

db.users.update(
  {'items.gear.owned.head_special_nye': null},
  {$set: {'items.gear.owned.head_special_nye': false}},
  {multi: 1}
);
