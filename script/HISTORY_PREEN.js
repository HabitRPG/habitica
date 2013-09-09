// FIXME this needs to be ported into algos.cron so it's run for each individual user on the server. It used to be a migration script
/**
 * Preen history for users with > 7 history entries
 * This takes an infinite array of single day entries [day day day day day...], and turns it into a condensed array
 * of averages, condensing more the further back in time we go. Eg, 7 entries each for last 7 days; 4 entries for last
 * 4 weeks; 12 entries for last 12 months; 1 entry per year before that: [day*7 week*4 month*12 year*infinite]
 */
function preenHistory(history) {
  history = _.filter(history, function(h) {return !!h}); // discard nulls (corrupted somehow)
  var newHistory = [];
  function preen(amount, groupBy) {
    var groups, avg, start;
    groups = _(history)
      .groupBy(function(h) { return moment(h.date).format(groupBy) }) // get date groupings to average against
      .sortBy(function(h,k) {return k;}) // sort by date
      .value(); // turn into an array
    amount++; // if we want the last 4 weeks, we're going 4 weeks back excluding this week. so +1 to account for exclusion
    start = (groups.length - amount > 0) ? groups.length - amount : 0;
    groups = groups.slice(start, groups.length - 1)
    _.each(groups, function(group){
      avg = _.reduce(group, function(mem, obj){ return mem + obj.value }, 0) / group.length;
      newHistory.push({date: +moment(group[0].date), value: avg});
      return true;
    })
  }

  preen(50, 'YYYY'); // last 50 years
  preen(12, 'YYYYMM'); // last 12 months
  preen(4, 'YYYYww'); // last 4 weeks
  newHistory = newHistory.concat(history.slice(-7)); // last 7 days
  return newHistory;
}

var minHistLen = 7;
db.users.find({

  // Registered users with some history
  $or: [
    { 'auth.local': { $exists: true }},
    { 'auth.facebook': { $exists: true }}
  ],
  'history': {$exists: true}

}).forEach(function(user) {
    var update = {$set:{}};

    _.each(user.tasks, function(task) {
      if ( task.history && task.history.length > minHistLen )
        update['$set']['tasks.' + task.id + '.history'] = preenHistory(task.history);
      return true;
    })

    if (user.history.exp && user.history.exp.length > minHistLen)
      update['$set']['history.exp'] = preenHistory(user.history.exp);
    if (user.history.todos && user.history.todos.length > minHistLen)
      update['$set']['history.todos'] = preenHistory(user.history.todos);

    if (!_.isEmpty(update['$set'])) db.users.update({_id: user._id}, update);
  });