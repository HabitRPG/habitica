// mongo habitrpg ./node_modules/lodash/index.js ./migrations/find_unique_user.js

/**
 * There are some rare instances of lost user accounts, due to a corrupt user auth variable (see https://github.com/lefnire/habitrpg/wiki/User-ID)
 * Past in the text of a unique habit here to find the user, then you can restore their UUID
 */

db.users.find().forEach(function(user){
    var found = _.any(user.tasks, {text: "Replace Me"})
    if (found) printjson({id:user._id, auth:user.auth});
})