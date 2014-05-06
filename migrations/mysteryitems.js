var _id = '';
var update = {
  $push: {
    'purchased.plan.mysteryItems':{
      $each:['back_mystery_201404','headAccessory_mystery_201404']
    }
  }
};

if (_id) {
  // singular (missing items)
  db.users.update({_id:_id}, update);
} else {
  // multiple (once @ start of event)
  db.users.update({'purchased.plan.customerId':{$ne:null}}, update, {multi:true});
}

