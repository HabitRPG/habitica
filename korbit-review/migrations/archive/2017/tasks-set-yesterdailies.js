/* let migrationName = 'tasks-set-yesterdaily'; */
// ... own data is done

/*
 * Iterates over all tasks and sets the yseterDaily field to True
 */

import monk from 'monk'; // eslint-disable-line import/no-extraneous-dependencies

const authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
const authorUuid = '';

const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
const dbTasks = monk(connectionString).get('tasks', { castIds: false });

const progressCount = 1000;
let count = 0;

function exiting (code, msg) {
  // 0 = success
  code = code || 0; // eslint-disable-line no-param-reassign
  if (code && !msg) {
    msg = 'ERROR!'; // eslint-disable-line no-param-reassign
  }
  if (msg) {
    if (code) {
      console.error(msg);
    } else {
      console.log(msg);
    }
  }
  process.exit(code);
}

function displayData () {
  console.warn(`\n${count} tasks processed\n`);
  return exiting(0);
}

function updatetask (task) {
  count += 1;
  const set = { yesterDaily: true };

  dbTasks.update({ _id: task._id }, { $set: set });

  if (count % progressCount === 0) console.warn(`${count} ${task._id}`);
  if (task._id === authorUuid) console.warn(`${authorName} processed`);
}

function updateTasks (tasks) {
  if (!tasks || tasks.length === 0) {
    console.warn('All appropriate tasks found and modified.');
    displayData();
    return null;
  }

  const taskPromises = tasks.map(updatetask);
  const lasttask = tasks[tasks.length - 1];

  return Promise.all(taskPromises)
    .then(() => processTasks(lasttask._id)); // eslint-disable-line no-use-before-define
}

function processTasks (lastId) {
  // specify a query to limit the affected tasks (empty for all tasks):
  const query = {
    yesterDaily: false,
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbTasks.find(query, {
    sort: { _id: 1 },
    limit: 250,
    // specify fields we are interested in to limit retrieved data
    // (empty if we're not reading data):
    fields: [
    ],
  })
    .then(updateTasks)
    .catch(err => {
      console.log(err);
      return exiting(1, `ERROR! ${err}`);
    });
}

export default processTasks;
