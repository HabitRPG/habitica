//mongo habitrpg ./node_modules/lodash/lodash.js migrations/20130602_survey_rewards.js

var members = [];
members = _.uniq(members);
print(members.length)

db.users.update({
    _id: {$exists:1},
    $or:[
        {_id: {$in: members}},
//        {'profile.name': {$in: members}},
        {'auth.facebook.name': {$in: members}},
        {'auth.local.username': {$in: members}},
        {'auth.local.email': {$in: members}}
    ]
},
{
    $set: { 'achievements.helpedHabit': true },
    $inc: { balance: 2.5 }
})