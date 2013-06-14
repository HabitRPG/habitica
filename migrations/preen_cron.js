/**
 * Set this up as a midnight cron script
 *
 * mongo habitrpg migrations/preen_cron.js
 */

load('./node_modules/lodash/lodash.js');
load('./node_modules/moment/moment.js');

/*
 Users are allowed to experiment with the site before registering. Every time a new browser visits habitrpg, a new
 "staged" account is created - and if the user later registeres, that staged account is considered a "production" account.
 This function removes all staged accounts that have been abandoned - either older than a month, or corrupted in some way (lastCron==undefined)
 */

var
    today = +new Date,

    un_registered = {
        "auth.local": {$exists: false},
        "auth.facebook": {$exists: false}
    },

    emptyParties = {
        $where: function(){
            return this.type === 'party' && this.members.length === 0;
        }
    };

//db.users.find(un_registered).forEach(function(user) {
//    //if (!user) return;
//    var lastCron = user.lastCron;
//    if (lastCron && moment(lastCron).isValid()) {
//        if (Math.abs(moment(today).diff(lastCron, 'days')) > 5) {
//            return db.users.remove({_id: user._id});
//        }
//    } else {
//        return db.users.update({_id: user._id}, {$set: {'lastCron': today}});
//    }
//});

//db.users.groups.remove(emptyParties);

//FIXME make sure this doesn't conflict with preen un_registered above

function preenHistory(history) {
    var newHistory = [];
    function preen(amount, format) {
        var group, sliced, avg;
        group = _(history)
            .groupBy(function(h){ return moment(h.date).format(format) })
            .sortBy(function(h,k) {return k;}); // TODO make sure this is the right order
        if (_.size(group) === 0) return;
        sliced = _.toArray(group).slice(_.size(group) - 1, -amount);
        avg = _.reduce(sliced, function(mem, obj){ return mem + obj.value }) / _.size(group);
        newHistory.concat({date: sliced[0].date, value: avg});
    }

    preen(50,'YYYY'); // last 50 years
    preen(12,'MMYYYY'); // last 12 months
    preen(4,'wYYYY'); // last 4 weeks
    newHistory.concat(history.slice(-7)); // last 7 days
    return newHistory;
}

db.users.find({
    $where: function(){ return this.history && this.history.exp && this.history.exp.length > 7; }
}).forEach(function(user) {
  var update = {$set:{}};

  _.each(user.tasks, function(task) {
      if (task.type === 'habit' || task.type === 'daily')
        update['$set']['tasks.' + task.id + '.history'] = preenHistory(task.history);
  })

  // TODO user.history.exp, user.history.todos

  if (!_.isEmpty(update['$set'])) db.users.update({_id:user.id}, update);
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