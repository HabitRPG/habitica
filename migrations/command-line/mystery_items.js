let UserNotification = require('../../website/server/models/userNotification').model;

let _id = '';

let items = ['back_mystery_201801', 'headAccessory_mystery_201801'];

let update = {
  $addToSet: {
    'purchased.plan.mysteryItems': {
      $each: items,
    },
  },
  $push: {
    notifications: (new UserNotification({
      type: 'NEW_MYSTERY_ITEMS',
      data: {
        items,
      },
    })).toJSON(),
  },
};

/* var update = {
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
  db.users.update({_id}, update);
} else {
  // multiple (once @ start of event)
  db.users.update({
    'purchased.plan.customerId': { $ne: null },
    $or: [
      { 'purchased.plan.dateTerminated': { $gte: new Date() } },
      { 'purchased.plan.dateTerminated': { $exists: false } },
      { 'purchased.plan.dateTerminated': { $eq: null } },
    ],
  }, update, { multi: true });
}
