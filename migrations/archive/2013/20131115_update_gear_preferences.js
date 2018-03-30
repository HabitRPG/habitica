// Add defaults to show gears in all users
db.users.update(
  {},
  {$set: {
    'preferences.showWeapon': true,
    'preferences.showShield': true,
    'preferences.showArmor': true,
  }},
  {multi: true}
);
