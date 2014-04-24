db.users.update(
  {'purchased.plan.customerId':{$ne:null}},
  {$push: {'purchased.plan.mysteryItems':{$each:['back_mystery_201404','headAccessory_mystery_201404']}}},
  {multi:true}
)