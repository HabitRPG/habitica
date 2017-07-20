var migrationName = '20170115_api_date_validation.js';
var authorName = 'sprusr'; // in case script author needs to know when their ...
var authorUuid = 'db711097-c5d0-4d25-8e5e-d955da4b79fd'; //... own data is done

/*
 * API date validation
 */

var monk = require('monk');

var connectionString = 'mongodb://localhost:27017/habitrpg?auto_reconnect=true'; // FOR TEST DATABASE

var dbTasks = monk(connectionString).get('tasks', { castIds: false });

var query = {
  date: { $exists: true }
};

console.warn('Updating tasks...');

dbTasks.find(query, 'date').each(function(task, cursor) {
  var updateQuery = {};
  var newDate = new Date(task.date);

  if(isValidDate(newDate)) {
    updateQuery = {
      $set: {
        'date': newDate
      }
    }
  } else {
    updateQuery = {
      $unset: {
        'date': ''
      }
    }
  }

  console.log(task, updateQuery);

  cursor.pause();

  dbTasks.update(task._id, updateQuery).then(function() {
    cursor.resume();
  });
}).then(function() {
  console.warn('All appropriate tasks found and modified.');
  return exiting(0);
}).catch(function(err) {
  return exiting(1, 'ERROR! ' + err);
});

function isValidDate(d) {
  return Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime());
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
