/*
 * Fix dates in the database that were stored as $type string instead of Date
 */
/* eslint-disable no-console */

const MIGRATION_NAME = '20201111_api_date';

import * as Tasks from '../website/server/models/task';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  let set = {};
  let newDate = new Date(user.date);
  if(isValidDate(newDate)) {
    set = {
      'date': newDate
    }
  } else {
    set = {
      'date': ''
    }
  }

  set.migration = MIGRATION_NAME;

  if (count % progressCount === 0) console.warn(`${count} ${user._id}`);
  return await Tasks.Task.update({_id: user._id}, {$set: set}).exec();
}

module.exports = async function processUsers () {
  let query = {
    migration: {$ne: MIGRATION_NAME}
  };

  const fields = {
    _id: 1,
    items: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await Tasks.Task // eslint-disable-line no-await-in-loop
      .find(query)
      .limit(250)
      .sort({_id: 1})
      .select(fields)
      .lean()
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate tasks found and modified.');
      console.warn(`\n${count} tasks processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1],
      };
    }

    await Promise.all(users.map(updateUser)); // eslint-disable-line no-await-in-loop
  }
};

function isValidDate(d) {
  return Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime());
}