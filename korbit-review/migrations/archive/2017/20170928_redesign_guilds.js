let migrationName = '20170928_redesign_guilds.js';

/*
 * Copy Guild Leader messages to end of Guild descriptions
 * Copy Guild logos to beginning of Guild descriptions
 */

let monk = require('monk');
let connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
let dbGroups = monk(connectionString).get('groups', { castIds: false });

function processGroups (lastId) {
  // specify a query to limit the affected groups (empty for all groups):
  let query = {
  };

  let fields = {
    description: 1,
    logo: 1,
    leaderMessage: 1,
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  return dbGroups.find(query, {
    fields,
    sort: {_id: 1},
    limit: 250,
  })
    .then(updateGroups)
    .catch(function (err) {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

let progressCount = 1000;
let count = 0;

function updateGroups (groups) {
  if (!groups || groups.length === 0) {
    console.warn('All appropriate groups found and modified.');
    displayData();
    return;
  }

  let groupPromises = groups.map(updateGroup);
  let lastGroup = groups[groups.length - 1];

  return Promise.all(groupPromises)
    .then(function () {
      processGroups(lastGroup._id);
    });
}

function updateGroup (group) {
  count++;

  let description = group.description;

  if (group.logo) {
    description = `![Guild Logo](${  group.logo  })\n\n&nbsp;\n\n${  description}`;
  }

  if (group.leaderMessage) {
    description = `${description  }\n\n&nbsp;\n\n${  group.leaderMessage}`;
  }

  let set = {
    description,
  };

  if (count % progressCount === 0) console.warn(`${count  } ${  group._id}`);

  return dbGroups.update({_id: group._id}, {$set: set});
}

function displayData () {
  console.warn(`\n${  count  } groups processed\n`);
  return exiting(0);
}

function exiting (code, msg) {
  code = code || 0; // 0 = success
  if (code && !msg) {
    msg = 'ERROR!';
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else      {
      console.log(msg);
    }
  }
  process.exit(code);
}

module.exports = processGroups;
