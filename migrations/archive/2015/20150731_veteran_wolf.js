// Run after the Veteran Tiger script, not before!

db.users.update(
  {'items.pets.Wolf-Veteran': {$exists: false}},
  {$set: {'items.pets.Wolf-Veteran': 5}},
  {multi: true}
);
