db.users.update(
  {},
  {$set: {'items.mounts.Gryphon-RoyalPurple': true}},
  {multi: true}
);
