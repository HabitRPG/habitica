import monk from 'monk'; // eslint-disable-line import/no-extraneous-dependencies
/* let migrationName = 'tasks-set-everyX'; */
const authorName = 'Sabe'; // in case script author needs to know when their ...
const authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; // ... own data is done

/*
 * Iterates over all tasks and sets invalid everyX values
 * (less than 0 or more than 9999 or not an int) field to 0
 */

const connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true';
const dbTasks = monk(connectionString).get('tasks', { castIds: false });

function processTasks (lastId) {
  // specify a query to limit the affected tasks (empty for all tasks):
  const query = {
    type: 'daily',
    everyX: {
      $not: {
        $gte: 0,
        $lte: 9999,
        $type: 'int',
      },
    },
  };

  if (lastId) {
    query._id = {
      $gt: lastId,
    };
  }

  dbTasks.find(query, {
    sort: { _id: 1 },
    limit: 250,
    fields: [],
  })
    .then(updateTasks)
    .catch(err => {
      console.log(err);
      return exiting(1, `ERROR! ${err}`);
    });
}

const progressCount = 1000;
let count = 0;

function updateTasks (tasks) {
  if (!tasks || tasks.length === 0) {
    console.warn('All appropriate tasks found and modified.');
    displayData();
    return null;
  }

  const taskPromises = tasks.map(updatetask);
  const lasttask = tasks[tasks.length - 1];

  return Promise.all(taskPromises)
    .then(() => processTasks(lasttask._id));
}

function updatetask (task) {
  count += 1;
  const set = { everyX: 0 };

  dbTasks.update({ _id: task._id }, { $set: set });

  if (count % progressCount === 0) console.warn(`${count} ${task._id}`);
  if (task._id === authorUuid) console.warn(`${authorName} processed`);
}

function displayData () {
  console.warn(`\n${count} tasks processed\n`);
  return exiting(0);
}

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

export default processTasks;
