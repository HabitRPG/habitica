var migrationName = 'tasks-set-everyX';
var authorName = 'Sabe'; // in case script author needs to know when their ...
var authorUuid = '7f14ed62-5408-4e1b-be83-ada62d504931'; //... own data is done

/*
 * Iterates over all tasks and sets invalid everyX values (less than 0 or more than 9999 or not an int) field to 0
 */

var monk = require('monk');
var connectionString = 'mongodb://sabrecat:z8e8jyRA8CTofMQ@ds013393-a0.mlab.com:13393/habitica?auto_reconnect=true';
var dbTasks = monk(connectionString).get('tasks', { castIds: false });

function processTasks(lastId) {
  // specify a query to limit the affected tasks (empty for all tasks):
  var query = {
    type: "daily",
    everyX: {
      $not: {
        $gte: 0,
        $lte: 9999,
        $type: "int",
      }
    },
  };

  if (lastId) {
    query._id = {
      $gt: lastId
    }
  }

  dbTasks.find(query, {
    sort: {_id: 1},
    limit: 250,
    fields: [],
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
    processTasks(lasttask._id);
  });
}

function updatetask (task) {
  count++;
  var set = {'everyX': 0};

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

module.exports = processTasks;
