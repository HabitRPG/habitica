db.users.update(
  {
    'purchased.plan.dateCreated': {$gte: new Date('2014-02-22'), $lt: new Date('2014-02-29')},
    'items.gear.owned.armor_mystery_201402': null,
    'items.gear.owned.head_mystery_201402': null,
    'items.gear.owned.back_mystery_201402': null,
    'purchased.plan.mysteryItems': {$nin: ['armor_mystery_201402', 'head_mystery_201402', 'back_mystery_201402']},
  },
  // {_id:1,'purchased.plan':1,'items.gear.owned':1}
  {$push: {'purchased.plan.mysteryItems': {$each: ['armor_mystery_201402', 'head_mystery_201402', 'back_mystery_201402']}}},
  {multi: true}
);/* .forEach(function(user){
    printjson(user);
  });*/
