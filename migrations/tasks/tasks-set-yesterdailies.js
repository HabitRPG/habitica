var migrationName = 'tasks-set-yesterdaily';
var authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
var authorUuid = ''; //... own data is done

/*
 * Iterates over all tasks and sets the yseterDaily field to True
 */

import monk from 'monk';

var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE
var dbTasks = monk(connectionString).get('tasks', { castIds: false });

function processTasks(lastId) {
  // specify a query to limit the affected tasks (empty for all tasks):
  var query = {
    yesterDaily: false,
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbTasks.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [ // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
    ],
  })
  .then(updateTasks)
  .catch(function (err) {
    console.log(err);
    return exiting(1, 'ERROR! ' + err);
  });
}

var progressCount = 1000;
var count = 0;

function updateTasks (tasks) {
  if (!tasks || tasks.length === 0) {
    console.warn('All appropriate tasks found and modified.');
    displayData();
    return;
  }

  var taskPromises = tasks.map(updatetask);
  var lasttask = tasks[tasks.length - 1];

  return Promise.all(taskPromises)
  .then(function () {
    processtasks(lasttask._id);
  });
}

function updatetask (task) {
  count++;
  var set = {'yesterDaily': true};

  dbTasks.update({_id: task._id}, {$set:set});

  if (count % progressCount == 0) console.warn(count + ' ' + task._id);
  if (task._id == authorUuid) console.warn(authorName + ' processed');
}

function displayData() {
  console.warn('\n' + count + ' tasks processed\n');
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

module.exports = processtasks;
