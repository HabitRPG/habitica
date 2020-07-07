/*
 * IMPORTANT:
 *
 * DO NOT TRUST THIS SCRIPT YET
 *
 *
 * This has been written by Alys to identify and remove duplicated tasks
 * i.e., tasks that have the same `id` value as another task.
 * However it could almost certainly be improved (the aggregation step HAS
 * to be easier that this!) and Alys is still working on it. Improvements
 * welcome.
 *
 * If you use it, do ALL of the following things:
 *
 * - configuration, as described below
 * - make a full backup of the user's data
 * - be aware of how to restore the user's data from that backup
 * - test the script first on a local copy of the database
 * - dump the user's data to a text file before running the script so that
 *   it can later be compared to a dump made afterwards
 * - run the script once first with both of the db.users.update() commands
 *   commented-out and check that the printed task IDs are correct
 * - run the script with all code enabled
 * - dump the user's data to a text file after running the script
 * - diff the two dumps to ensure that only the correct tasks were removed
 *
 *
 * When two tasks exist with the same ID, only one of those tasks will be
 * removed (whichever copy the script finds first).
 * If three tasks exist with the same ID, you'll probably need to run this
 * script twice.
 *
 */

// CONFIGURATION:
// - Change the uuid below to be the user's uuid.
// - Change ALL instances of "todos" to "habits"/"dailys"/"rewards" as
//   needed. Do not miss any of them!

const uuid = '30fb2640-7121-4968-ace5-f385e60ea6c5';

db.users.aggregate([
  {
    $match: {
      _id: uuid,
    },
  },
  {
    $project: {
      _id: 0, todos: 1,
    },
  },
  { $unwind: '$todos' },
  {
    $group: {
      _id: { taskid: '$todos.id' },
      count: { $sum: 1 },
    },
  },
  {
    $match: {
      count: { $gt: 1 },
    },
  },
  {
    $project: {
      '_id.taskid': 1,
    },
  },
  {
    $group: {
      _id: { taskid: '$todos.id' },
      troublesomeIds: { $addToSet: '$_id.taskid' },
    },
  },
  {
    $project: {
      _id: 0,
      troublesomeIds: 1,
    },
  },
]).forEach(data => {
  // print( "\n" ); printjson(data);
  data.troublesomeIds.forEach(taskid => {
    print(`non-unique task: ${taskid}`); // eslint-disable-line no-restricted-globals
    db.users.update({
      _id: uuid,
      todos: { $elemMatch: { id: taskid } },
    }, {
      $set: { 'todos.$.id': 'de666' },
    });
  });
});

db.users.update(
  { _id: uuid },
  { $pull: { todos: { id: 'de666' } } },
  { multi: false },
);
