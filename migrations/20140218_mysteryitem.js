db.users.update(
  {'purchased.plan.customerId':{$ne:null}},
//  {_id:'9'},
  {$push: {'purchased.plan.mysteryItems':{$each:['armor_mystery_201402','head_mystery_201402','back_mystery_201402']}}},
  {multi:true}
)