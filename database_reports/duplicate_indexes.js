db.users.aggregate([
  { $group: {
//    _id: { "auth.local.username": "$auth.local.username" },
//    _id: { "auth.facebook.id": "$auth.facebook.id" },
    _id: { "auth.local.email": "$auth.local.email" },
    uniqueIds: { $addToSet: "$_id" },
    count: { $sum: 1 }
  }},
  { $match: {
    count: { $gt: 1 }
  }}
]).forEach(function(user){
  // handle duplicates. likely, delete the accounts with older lastCron, or with the starter tasks.
})