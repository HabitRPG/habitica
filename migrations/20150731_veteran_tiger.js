db.users.update(
  {},
  {$set:{'items.pets.Tiger-Veteran':5}},
  {multi:true}
);
