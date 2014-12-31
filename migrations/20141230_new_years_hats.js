db.users.update(
    {'gear.owned.head_special_nye':{$ne:null}},
    {$set:{'gear.owned.head_special_nye2014':false}},
    {multi:1}
)

db.users.update(
    {'gear.owned.head_special_nye':null},
    {$set:{'gear.owned.head_special_nye':false}},
    {multi:1}
)
