// run with %mongo server:port/dbname node_modules/moment/moment.js migrations/my_commands.js
var unRegistered = { 'auth.local': { $exists: false }, 'auth.facebook': { $exists: false} },
    registered = { $or: [
        { 'auth.local': { $exists: true } },
        { 'auth.facebook': { $exists: true} }
    ]};
db.users.count(registered);
db.users.count(unRegistered);
db.users.find(unRegistered).forEach(function(user) {
    var lastCron = new Date(user.lastCron),
        today = new Date(),
        diff = Math.abs(moment(today).sod().diff(moment(lastCron).sod(), 'days'));

    if (diff > 30) {
        db.users.remove({ _id: user._id });
    }
});
db.users.count(registered);
db.users.count(unRegistered);