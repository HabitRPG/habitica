db.users.update(
  {'items.pets.Wolf-Veteran': {$ne: null}},
  {$set: {'items.pets.Tiger-Veteran': 5}},
  {multi: true}
);
