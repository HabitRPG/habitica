/**
 * Set this up as a midnight cron script
 *
 * mongo habitrpg migrations/preen_cron.js
 */

load('./node_modules/lodash/lodash.js');
load('./node_modules/moment/moment.js');

var today = +new Date;

/**
 * Users are allowed to experiment with the site before registering. Every time a new browser visits habitrpg, a new
 * "staged" account is created - and if the user later registeres, that staged account is considered a "production" account.
 * This function removes all staged accounts that have been abandoned - either older than a month, or corrupted in some way (lastCron==undefined)
 */
db.users.find({

    // Un-registered users
    "auth.local": {$exists: false},
    "auth.facebook": {$exists: false}

}).forEach(function(user) {
    //if (!user) return;
    var lastCron = user.lastCron;
    if (lastCron && moment(lastCron).isValid()) {
        if (Math.abs(moment(today).diff(lastCron, 'days')) > 5) {
            return db.users.remove({_id: user._id});
        }
    } else {
        return db.users.update({_id: user._id}, {$set: {'lastCron': today}});
    }
});

/**
 * Remove empty parties
 */
db.users.groups.remove({
    // Empty Parties
    $where: function(){ return this.type === 'party' && this.members.length === 0; }
});

/**
 * Preen history for users with > 7 history entries
 */
function preenHistory(history) {
    var newHistory = [];
    function preen(amount, format) {
        var groups, avg, start;
        groups = _(history)
            .groupBy(function(h){ return moment(h.date).format(format) })
            .sortBy(function(h,k) {return k;}) // TODO make sure this is the right order
            .value()
        start = (groups.length - amount > 0) ? groups.length - amount : 0;
        groups = groups.slice(start, groups.length - 1)
        _.each(groups, function(group){
            avg = _.reduce(group, function(mem, obj){ return mem + obj.value }, 0) / group.length;
            newHistory.push({date: +moment(group[0].date), value: avg});
        })
    }

    preen(50, 'YYYY', 'YYYY'); // last 50 years
    preen(12, 'YYYYMM', 'MMM YYYY'); // last 12 months
    preen(4, 'YYYYww', 'WW YYYY'); // last 4 weeks
    newHistory = newHistory.concat(history.slice(-7)); // last 7 days
    return newHistory;
}

db.users.find({

    // Registered users with > 7 history entries
    $or: [
        { 'auth.local': { $exists: true }},
        { 'auth.facebook': { $exists: true }}
    ],
    $where: function(){ return this.history && this.history.exp && this.history.exp.length > 7; }

}).forEach(function(user) {
  var update = {$set:{}};

  _.each(user.tasks, function(task) {
      if (task.type === 'habit' || task.type === 'daily')
        update['$set']['tasks.' + task.id + '.history'] = preenHistory(task.history);
  })

  update['$set']['history.exp'] = preenHistory(user.history.exp);
  update['$set']['history.todos'] = preenHistory(user.history.todos);

  db.users.update({_id: user._id}, update);
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