db.users.update(
  {preferences: {$exists: false}},
  {$set: {preferences: {gender: 'm', armorSet: 'v1'}}},
  {multi: true}
);
