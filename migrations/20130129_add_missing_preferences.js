db.users.update(
    {'preferences':{$exists:false}},
    {$set:{preferences:{gender:'m'}}},
    {multi:true}
)