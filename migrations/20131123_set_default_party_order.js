// Add default to randomize party members list
db.users.update(
  {},
  {$set: {
    'party.order': 'random',
  }},
  {multi: true}
);
