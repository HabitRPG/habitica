var _id = '';
var update = {
  $addToSet: {
    'purchased.plan.mysteryItems':{
      $each:['headAccessory_mystery_201510','back_mystery_201510']
    }
  }
};

/*var update = {
  $set:{
    'purchased.plan':{
      customerId: "",
      dateCreated: new Date(),
      dateTerminated: null,
      dateUpdated:new Date(),
      gemsBought: 0,
      mysteryItems: [],
      paymentMethod: "Paypal",
      planId : "basic_earned"
    }
  }
};*/

if (_id) {
  // singular (missing items)
  db.users.update({_id:_id}, update);
} else {
  // multiple (once @ start of event)
  var query = {
    'purchased.plan.customerId': { $ne:null },
    'purchased.plan.dateTerminated': { $gt : new Date() }
  }
  db.users.update({query, update, {multi:true});
}
