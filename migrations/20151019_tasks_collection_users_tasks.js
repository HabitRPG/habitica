// Migrate users' tasks to individual models
// This should run AFTER 20151019_tasks_collection_challenges_tasks.js

// Enable coffee-script
require('coffee-script');

// Load config
var nconf = require('nconf');
var utils = require('../website/src/utils');
utils.setupConfig();

// Initialize mongoose
require('mongoose');

var mongooseOptions = {
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
};
var db = mongoose.connect(nconf.get('NODE_DB_URI'), mongooseOptions, function(err) {
  if (err) throw err;
  logging.info('Connected with Mongoose');
});

//...

var shared = require('../common/script');

// Load models
var UserModel = require('../website/src/models/user').model;
var TaskModel = require('../website/src/models/task').model;

// ... given an user

// add tasks order arrays

user.tasksOrder = {
  habits: [],
  rewards: [],
  todos: [],
  dailys: []
};

// ... convert tasks to individual models
var tasks = user.dailys
  .concat(user.habits)
  .concat(user.rewards)
  .concat(user.todos)
  .map(function(task) {
    task._id = task.id;
    delete task.id;

    task.userId = user._id;
    task = new TaskModel(task); // this should also fix dailies that wen to the habits array or vice-versa

    // In case of a challenge task, assign a new id and link the original task
    if(task.challenge && task.challenge.id) {
      task.challenge.taskId = task._id;
      task._id = shared.uuid();
    }

    TaskModel.findOne({_id: task._id}, function(err, taskSameId){
      if(err) throw err;

      // We already have a task with the same id, change this one
      if(taskSameId) {
        task._id = shared.uuid();
      }

      task.save(function(err, savedTask){
        if(err) throw err;

        user.tasksOrder[savedTask.type + 's'].push(savedTask._id);
      });
    });
  });

delete user.habits;
delete user.dailys;
delete user.todos;
delete user.rewards;

UserModel.update({_id: user._id}, {
  $set: {tasksOrder: user.tasksOrder},
  $unset: {habits: 1, dailys: 1, rewards: 1, todos: 1}
});