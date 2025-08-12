db.users.update(
  {},
  {
    $inc: {
      'items.food.Candy_Base': 1,
      'items.food.Candy_CottonCandyBlue': 1,
      'items.food.Candy_CottonCandyPink': 1,
      'items.food.Candy_Desert': 1,
      'items.food.Candy_Golden': 1,
      'items.food.Candy_Red': 1,
      'items.food.Candy_Shade': 1,
      'items.food.Candy_Skeleton': 1,
      'items.food.Candy_White': 1,
      'items.food.Candy_Zombie': 1,
    },
  },
  {multi: 1}
);