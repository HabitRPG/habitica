var migrationName = '20170928_redesign_guilds.js';

/*
 * Copy Guild Leader messages to end of Guild descriptions
 * Copy Guild logos to beginning of Guild descriptions
 */

var monk = require('monk');
var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbGroups = monk(connectionString).get('groups', { castIds: false });

function processGroups(lastId) {
  // specify a query to limit the affected groups (empty for all groups):
  var query = {
  };

  var fields = {
    'description': 1,
    'logo': 1,
    'leaderMessage': 1,
  }

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  return dbGroups.find(query, {
    fields: fields,
    sort: {_id: 1},
    limit: 250,
  })
  .then(updateGroups)
  .catch(function (err) {
    console.log(err);
    return exiting(1, 'ERROR! ' + err);
  });
}

var progressCount = 1000;
var count = 0;

function updateGroups (groups) {
  if (!groups || groups.length === 0) {
    console.warn('All appropriate groups found and modified.');
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

  var description = group.description;

  if (group.logo) {
    description = '![Guild Logo](' + group.logo + ')\n\n&nbsp;\n\n' + description;
  }

  if (group.leaderMessage) {
    description = description + '\n\n&nbsp;\n\n' + group.leaderMessage;
  }

  var set = {
    description: description,
  };

  if (count % progressCount == 0) console.warn(count + ' ' + group._id);

  return dbGroups.update({_id: group._id}, {$set:set});
}

function displayData() {
  console.warn('\n' + count + ' groups processed\n');
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
