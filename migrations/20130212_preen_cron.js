// include moment

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
        if (diff > 7) {
            return db.users.remove({_id:user._id});
        }
    } else {
        return db.users.update({_id: user._id}, {$set: {lastCron: today}});
    }
});
