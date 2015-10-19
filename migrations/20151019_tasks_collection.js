// Initialize mongoose
require('mongoose');
//...

var shared = require('../common/script');

// Load models
var UserModel = require('../website/src/models/user');
var TaskModel = require('../website/src/models/task');

// ... given an user

// ... convert tasks to individual models
user.dailys
  .concat(user.habits)
  .concat(user.rewards)
  .concat(user.todos)
  .forEach(function(task) {
    task._id = id;
    delete task.id;
    task = new TaskModel(task);

    TaskModel.findOne({_id: task._id}, function(err, taskSameId){
      if(err) throw err;

      // We already have a task with the same id, change this one
      if(taskSameId) {
        task._id = shared.uuid();
      }

      task.save(function(err){
        if(err) throw err;
      });
    });
  });

// ... add tasksOrder to user
['habits', 'dailys', 'rewards', 'todos'].forEach(function(type){
  user.tasksOrder[type] = user[type].map(function(task){
    return task._id;
  });
});

UserModel.update({_id: user._id}, {
  $set: {tasksOrder: user.tasksOrder},
  $unset: {habits: 1, dailys: 1, rewards: 1, todos: 1}
});