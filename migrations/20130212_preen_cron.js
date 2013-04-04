/**
 * Set this up as a midnight cron script
 *
 * mongo habitrpg node_modules/moment/moment.js migrations/json.js migrations/20130212_preen_cron.js
 */


/*
 Users are allowed to experiment with the site before registering. Every time a new browser visits habitrpg, a new
 "staged" account is created - and if the user later registeres, that staged account is considered a "production" account.
 This function removes all staged accounts that have been abandoned - either older than a month, or corrupted in some way (lastCron==undefined)
 */

var un_registered = {
    "auth.local": {$exists: false},
    "auth.facebook": {$exists: false}
};
var registered = {
    $or: [
        { 'auth.local': { $exists: true }},
        { 'auth.facebook': { $exists: true }}
    ]
};

var today = +(new Date);

//  isValidDate = (d) ->
//    return false  if Object::toString.call(d) isnt "[object Date]"
//    not isNaN(d.getTime())


db.users.find(un_registered).forEach(function(user) {
    var diff, lastCron;
    if (!user) return;
    if (!!user.lastCron) {
        lastCron = new Date(user.lastCron);
        diff = Math.abs(moment(today).startOf('day').diff(moment(lastCron).startOf('day'), "days"));
        if (diff > 3) {
            return db.users.remove({_id:user._id});
        }
    } else {
        return db.users.update({_id: user._id}, {$set: {lastCron: today}});
    }
});


/**
 * Don't remove missing user auths anymore. This was previously necessary due to data corruption,
 * revisit if needs be
 */
/*db.sessions.find().forEach(function(sess){
    var uid = JSON.parse(sess.session).userId;
    if (!uid || db.users.count({_id:uid}) === 0) {
        db.sessions.remove({_id:sess._id});
    }
});*/