/* let migrationName = 'tasks-set-yesterdaily'; */
let authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
let authorUuid = ''; // ... own data is done

/*
 * Iterates over all tasks and sets the yseterDaily field to True
 */

import monk from 'monk';

let connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
let dbTasks = monk(connectionString).get('tasks', { castIds: false });

let progressCount = 1000;
let count = 0;

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

function displayData () {
  console.warn(`\n${  count  } tasks processed\n`);
  return exiting(0);
}

function updatetask (task) {
  count++;
  let set = {yesterDaily: true};

  dbTasks.update({_id: task._id}, {$set: set});

  if (count % progressCount === 0) console.warn(`${count  } ${  task._id}`);
  if (task._id === authorUuid) console.warn(`${authorName  } processed`);
}

function updateTasks (tasks) {
  if (!tasks || tasks.length === 0) {
    console.warn('All appropriate tasks found and modified.');
    displayData();
    return;
  }

  let taskPromises = tasks.map(updatetask);
  let lasttask = tasks[tasks.length - 1];

  return Promise.all(taskPromises)
    .then(() => {
      return processTasks(lasttask._id); // eslint-disable-line no-use-before-define
    });
}

function processTasks (lastId) {
  // specify a query to limit the affected tasks (empty for all tasks):
  let query = {
    yesterDaily: false,
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbTasks.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [ // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
    ],
  })
    .then(updateTasks)
    .catch((err) => {
      console.log(err);
      return exiting(1, `ERROR! ${  err}`);
    });
}

module.exports = processTasks;
