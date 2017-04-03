//mongo habitrpg ./node_modules/lodash/lodash.js migrations/20130602_survey_rewards.js

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

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