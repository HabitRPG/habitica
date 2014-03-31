db.users.update(
  {'purchased.plan.customerId':{$ne:null}},
  {$push: {'purchased.plan.mysteryItems':{$each:['armor_mystery_201403','headAccessory_mystery_201403']}}},
  {multi:true}
)