//mongo habitrpg ./node_modules/lodash/lodash.js migrations/20130602_survey_rewards.js

var members = []
members = _.uniq(members);

var query = {
    _id: {$exists:1},
    $or:[
        {_id: {$in: members}},
        //{'profile.name': {$in: members}},
        {'auth.facebook.name': {$in: members}},
        {'auth.local.username': {$in: members}},
        {'auth.local.email': {$in: members}}
    ]
};

print(db.users.count(query));

db.users.update(query,
    {
        $set: { 'achievements.helpedHabit': true },
        $inc: { balance: 2.5 }
    },
    {multi:true}
)