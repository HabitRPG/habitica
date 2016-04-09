import _ from 'lodash';

// From server pass task.toObject() not the task document directly
module.exports = function updateTask (task, req = {}) {
  // If reminders are updated -> replace the original ones
  if (req.body.reminders) {
    task.reminders = req.body.reminders;
    delete req.body.reminders;
  }

  // If checklist is updated -> replace the original one
  if (req.body.checklist) {
    task.checklist = req.body.checklist;
    delete req.body.checklist;
  }

  // If tags are updated -> replace the original ones
  if (req.body.tags) {
    task.tags = req.body.tags;
    delete req.body.tags;
  }

  _.merge(task, _.omit(req.body, ['_id', 'id', 'type']));

  return task;
};
