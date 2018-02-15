db.users.update(
  {'items.gear.owned.armor_special_birthday': {$ne: null}},
  {$set: {'items.gear.owned.armor_special_birthday2015': false}},
  {multi: 1}
);

db.users.update(
  {'items.gear.owned.armor_special_birthday': null},
  {$set: {'items.gear.owned.armor_special_birthday': false}},
  {multi: 1}
);

db.users.update({}, {$inc: {
  'items.food.Cake_Skeleton': 1,
  'items.food.Cake_Base': 1,
  'items.food.Cake_CottonCandyBlue': 1,
  'items.food.Cake_CottonCandyPink': 1,
  'items.food.Cake_Shade': 1,
  'items.food.Cake_White': 1,
  'items.food.Cake_Golden': 1,
  'items.food.Cake_Zombie': 1,
  'items.food.Cake_Desert': 1,
  'items.food.Cake_Red': 1,
}}, {multi: 1});

db.users.update(
  {'achievements.habitBirthday': true},
  {$set: {'achievements.habitBirthdays': 1}},
  {multi: 1}
);

db.users.update(
  {},
  {$inc: {'achievements.habitBirthdays': 1}},
  {multi: 1}
);