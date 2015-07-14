db.users.update(
  {'flags.armoireEmpty':true},
  {$set:{'flags.armoireEmpty':false}},
  {multi:true}
);
