import _ from 'lodash';

// From server pass task.toObject() not the task document directly
module.exports = function updateTask (task, req = {}) {
  let body = req.body || {};

  // If reminders are updated -> replace the original ones
  if (body.reminders) {
    task.reminders = body.reminders;
  }

  // If checklist is updated -> replace the original one
  if (body.checklist) {
    task.checklist = body.checklist;
  }

  // If tags are updated -> replace the original ones
  if (body.tags) {
    task.tags = body.tags;
  }

  _.merge(task, _.omit(body, ['_id', 'id', 'type', 'reminders', 'checklist', 'tags']));

  return [task];
};
