db.users.update({}, {$set: {
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
