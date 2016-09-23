var _id = '';
var update = {
  $addToSet: {
    'purchased.plan.mysteryItems':{
      $each:['head_mystery_201609','armor_mystery_201609']
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
  db.users.update({_id: _id}, update);
} else {
  // multiple (once @ start of event)
  db.users.update({
      'purchased.plan.customerId': { $ne: null },
      $or: [
        { 'purchased.plan.dateTerminated': { $gte: new Date() } },
        { 'purchased.plan.dateTerminated': { $exists: false } },
        { 'purchased.plan.dateTerminated': { $eq: null } }
      ]
  }, update, { multi: true });
}
