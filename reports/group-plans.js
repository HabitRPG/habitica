var migrationName = 'group-plans.js';

/*
 * Count active group plan subscriptions
 */

var monk = require('monk');
var moment = require('moment');
var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbGroups = monk(connectionString).get('groups', { castIds: false });

function processGroups(lastId) {
  var query = {
    'purchased.plan': {$exists:true},
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbGroups.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [
      'purchased.plan': 1
    ] // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  })
  .then(updateGroups)
  .catch(function (err) {
    console.log(err);
    return exiting(1, 'ERROR! ' + err);
  });
}

var progressCount = 10;
var count = 0;
var matching = 0;

function updateGroups (groups) {
  if (!groups || groups.length === 0) {
    console.warn('All appropriate groups found.');
    displayData();
    return;
  }

  var groupPromises = groups.map(updateGroup);
  var lastGroup = groups[groups.length - 1];

  return Promise.all(groupPromises)
  .then(function () {
    processGroups(lastGroup._id);
  });
}

function updateGroup (group) {
  count++;
  if (count % progressCount == 0) console.warn(count + ' ' + group._id);

  let now = new Date();
  let plan = group.purchased.plan;
  if (plan.customerId && (!plan.dateTerminated || moment(plan.dateTerminated).isAfter(now))) matching++;
}

function displayData() {
  console.warn('\n' + count + ' groups processed\n');
  console.warn('\n' + matching + ' active group subscriptions\n');
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

module.exports = processGroups;
