var migrationName = '20160111_challenges_condense_same_day_history_entries.js';

/*
 * Compress challenges tasks history entries so that only one entry per day is kept
 */

var dbserver = '';
var dbname = '';

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var mongo = require('mongoskin');
var _ = require('lodash');
var moment = require('moment');

var dbChallenges = mongo.db(dbserver + '/' + dbname + '?auto_reconnect').collection('challenges');

// Find all challenges
var query = {
};

// we only want habits and dailies (rewards and todos don't have history)
var fields = {
  'habits': 1,
  'dailys': 1,
};

function compressEntries (history) {
  return _.chain(history)
    .filter(function(entry) {
      return !!entry;
    })
    .groupBy(function(entry) { // group by day
      return moment(entry.date).format('YYYYMMDD');
    })
    .sortBy(function(entry, key) { // sort by date and transform back to array of array of entries
      return key;
    })
    .map(function(entries) { // aggregate the value
      return {
        date: Number(entries[0].date),
        value: _.reduce(entries, function (previousValue, entry) {
          return previousValue + entry.value;
        }, 0) / entries.length,
      };
    })
    .value();
};

console.warn('Updating challenges...');
var progressCount = 100;
var count = 0;

dbChallenges.findEach(query, fields, {batchSize: 250}, function(err, challenge) {
  if (err) { return exiting(1, 'ERROR! ' + err); }
  if (!challenge) {
    console.warn('All appropriate challenges found.');
    return displayData();
  }
  count++;

  // specify challenge data to change:
  var set = {};

  if (challenge.habits && challenge.habits.length > 0) {
    challenge.habits.forEach(function(habit, index) {
      if (habit.history && habit.history.length > 1) {
        var originalL = habit.history.length;
        habit.history = compressEntries(habit.history);
        if (originalL > 1000) console.log(originalL, habit.history.length);
        set['habits.' + index + '.history'] = habit.history;
      }
    });
  }

  if (challenge.dailys && challenge.dailys.length > 0) {
    challenge.dailys.forEach(function(daily, index) {
      if (daily.history && daily.history.length > 1) {
        var originalL = daily.history.length;
        daily.history = compressEntries(daily.history);
        if (originalL > 1000) console.log(originalL, daily.history.length);
        set['dailys.' + index + '.history'] = daily.history;
      }
    });
  }

  dbChallenges.update({_id: challenge._id}, {$set: set}, function(err) {
    if(err) throw err;
    console.log('updated a challenge');
  });
  if (count%progressCount == 0) console.warn(count + ' ' + challenge._id);
});

function displayData() {
  console.warn('\n' + count + ' challenges processed\n');
  return exiting(0);
}


function exiting(code, msg) {
  code = code || 0; // 0 = success
  if (code && !msg) { msg = 'ERROR!'; }
  if (msg) {
    if (code) { console.error(msg); }
    else      { console.log(  msg); }
  }
  process.exit(code);
}
