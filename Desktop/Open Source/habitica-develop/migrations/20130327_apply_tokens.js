/**
 * Applies backer tokens & items (this file will be updated periodically
 */

// mongo habitrpg ./node_modules/underscore/underscore.js migrations/20130327_apply_tokens.js

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var mapping = [
    {
        tier: 1,
        tokens: 0,
        users: []
    },
    {
        tier: 5,
        tokens: 20,
        users: []
    },
    {
        tier: 10,
        tokens: 50,
        users: []
    },
    {
        tier: 15,
        tokens: 100,
        users: []
    },
    {
        tier: 30,
        tokens: 150,
        users: []
    },
    {
        tier: 45,
        tokens: 170,
        users: []
    },
    {
        tier: 60,
        tokens: 200,
        users: []
    },
    {
        tier: 70,
        tokens: 240,
        users: []
    },
    {
        tier: 80,
        tokens: 240,
        users: []
    },
    {
        tier: 90,
        tokens: 280,
        users: []
    },
    {
        tier: 300,
        tokens: 500,
        users: []
    },
    {
        tier: 800,
        tokens: 500,
        users: []
    }
];

db.users.find().forEach(function(user){
    if (!user._id) return;

    var possibleUserIds = [user._id];
    if (!!user.local) {
        if (!!user.local.username) possibleUserIds.push(user.local.username);
        if (!!user.local.email) possibleUserIds.push(user.local.email);
    }

    _.each(mapping, function(tier){
        var userInTier = !_.isEmpty(_.intersection(tier.users, possibleUserIds));
        if (userInTier) {
            var tokenInc = 0,
                backer = user.backer || {};
            if (!backer.tokensApplied) {
                tokenInc = tier.tokens;
                backer.tokensApplied = true;
            }
            backer.tier = tier.tier;

            try {
                db.users.update(
                    {_id:user._id},
                    {
                        $set: { backer: backer, 'flags.ads': 'hide' },
                        $inc: { balance: (tokenInc/4) }
                    }
                );
            } catch(e) {
                print(e);
            }
        }
    })

})