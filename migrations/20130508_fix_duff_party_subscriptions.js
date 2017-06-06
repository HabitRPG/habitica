/**
 * 745612d and fedc5b6 added a db-subscription optimization to the initial subscribe.
 * However, it requires the user only be to one party. That should be the case anyway, but user.party.current was letting
 * us look past the fact that a user was erroneously subscribed to multiple parties. This fixes
 *
 * mongo habitrpg ./node_modules/underscore/underscore.js ./migrations/20130508_fix_duff_party_subscriptions.js
 */

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

// since our primary subscription will first hit parties now, we *definitely* need an index there
db.parties.ensureIndex( { 'members': 1}, {background: true} );

db.parties.find().forEach(function(party){

    if(!party.members) {
        return db.parties.remove({_id:party._id});
    }

    // Find all members
    db.users.find( {_id: {$in:party.members} }, {_id:1,party:1} ).forEach(function(user){
        // user somehow is subscribed to this party in the background, but they're it's not their primary party
        if (user.party && user.party.current !== party._id) {
            var i = party.members.indexOf(user._id);
            party.members.splice(i, 1);
        }

        // if after we remove the user, the party is empty - delete this party
        if (_.isEmpty(party.members)) {
            db.parties.remove({_id:party._id});

        // else just set it
        } else {
            db.parties.update({_id:party._id}, {$set:{members:party.members}});
        }
    })
})
