import merge from 'lodash/merge';
import omit from 'lodash/omit';

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

  merge(task, omit(body, ['_id', 'id', 'type', 'reminders', 'checklist', 'tags']));

  // Ensure arrays are emptied
  if (body.daysOfMonth && body.daysOfMonth.length === 0) {
    task.daysOfMonth = [];
  }

  if (body.weeksOfMonth && body.weeksOfMonth.length === 0) {
    task.weeksOfMonth = [];
  }

  return [task];
};
