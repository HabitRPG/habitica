var uuid = require('uuid').v4;
var mongo = require('mongodb').MongoClient;
var _ = require('lodash');

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

var taskIds = require('checklists-no-id.json').map(function (obj) {
  return obj._id;
});

// Fix empty task.checklistt.id

var progressCount = 100;
var count = 0;

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
}

mongo.connect('db url')
.then(function (db) {
  var dbTasks = db.collection('tasks');

  // specify a query to limit the affected tasks (empty for all tasks):
  var query = {
    '_id':{ $in: taskIds },
  };

  // specify fields we are interested in to limit retrieved data (empty if we're not reading data):
  var fields = {
    'checklist': 1,
  };

  console.warn('Updating tasks...');

  dbTasks.find(query, fields, {batchSize: 250}).toArray(function(err, tasks) {
    if (err) { return exiting(1, 'ERROR! ' + err); }

    tasks.forEach(function (task) {
      var checklist = task.checklist || [];
      checklist.forEach(function (item) {
        if (!item.id || item.id === "") {
          item.id = uuid();
        }
      });

      // specify user data to change:
      var set = {
        checklist: checklist,
      };
      //console.log(set);

      dbTasks.update({_id: task._id}, {$set: set}, function (err, res) {
        if (err) console.error('Error while updating', err);
      });

      count++;
      if (count % progressCount == 0) console.warn(count + ' ' + task._id);
    });

    if (count === tasks.length) {
      console.warn('All appropriate tasks found and modified.');
      return displayData();
    }
  });
})
.catch(function (err) {
  throw err;
});