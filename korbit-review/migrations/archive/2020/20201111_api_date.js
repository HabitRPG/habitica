/*
 * Fix dates in the database that were stored as $type string instead of Date
 */
/* eslint-disable no-console */

const MIGRATION_NAME = '20201111_api_date';

import * as Tasks from '../../../website/server/models/task';

const progressCount = 1000;
let count = 0;

async function updateUser (todo) {
  count++;

  if (count % progressCount === 0) console.warn(`${count} ${todo._id}`);

  const newDate = new Date(todo.date);
  if (isValidDate(newDate)) return;

  return await Tasks.Task.update({_id: todo._id, type: 'todo'}, {$unset: {date: ''}}).exec();
}

module.exports = async function processUsers () {
  let query = {
    type: 'todo',
    date: {$exists: true},
    updatedAt: {$gt: new Date('2020-11-23')},
  };

  const fields = {
    _id: 1,
    type: 1,
    date: 1,
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await Tasks.Task // eslint-disable-line no-await-in-loop
      .find(query)
      .select(fields)
      .limit(250)
      .sort({_id: 1})
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
  return !isNaN(d.getTime());
}
