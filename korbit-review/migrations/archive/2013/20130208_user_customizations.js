db.users.update(
  {items: {$exists: 0}},
  {$set: {items: {weapon: 0, armor: 0, head: 0, shield: 0 }}},
  {multi: true}
);

db.users.find().forEach(function (user) {
  let updates = {
    // I'm not racist, these were just the defaults before ;)
    'preferences.skin': 'white',
    'preferences.hair': 'blond',

    'items.head': user.items.armor,
    'items.shield': user.items.armor,
  };

  db.users.update({_id: user._id}, {$set: updates});
});