import * as Tasks from '../models/task';
import {model as Groups} from '../models/group';
import {model as Users} from '../models/user/index';

const SHARED_COMPLETION = {
  default: 'recurringCompletion',
  single: 'singleCompletion',
  every: 'allAssignedCompletion',
};

async function _completeMasterTask (masterTask) {
  masterTask.completed = true;
  await masterTask.save();
}

async function _deleteOrCompleteUnfinishedTasks (groupMemberTask) {
  if (groupMemberTask.type == 'todo') {
    // The task was done by one person and is removed from others' lists
    await Tasks.Task.deleteMany({
      'group.taskId': groupMemberTask.group.taskId,
      $and: [
        {userId: {$exists: true}},
        {userId: {$ne: groupMemberTask.userId}},
      ],
    }).exec();
  } else {
    // Complete the task on other users' lists
    await Tasks.Task.find({
      'group.taskId': groupMemberTask.group.taskId,
      $and: [
        {userId: {$exists: true}},
        {userId: {$ne: groupMemberTask.userId}}
      ]},
      function (err, tasks) {
        // @REVIEW How does Habitica handle errors?
        if (err) return;

        tasks.forEach (task => {
          // @REVIEW Completed or notDue tasks have no effect at cron
          // This maintain's the user's streak without scoring the task if someone else completed the task
          // If no assignedUser completes the due daily, all users lose their streaks at their cron
          // An alternative is to set the other assignedUsers' tasks to a later startDate
          // Should we break their streaks to encourage competition for the daily?
          task.completed = true;
          task.save();
        });
      });
  }
}

async function _evaluateAllAssignedCompletion (masterTask) {
  let completions;
  if (masterTask.group.approval && masterTask.group.approval.required) {
    completions = await Tasks.Task.count({
      'group.taskId': masterTask._id,
      'group.approval.approved': true,
    }).exec();
    completions++;
  } else {
    completions = await Tasks.Task.count({
      'group.taskId': masterTask._id,
      completed: true,
    }).exec();
  }
  if (completions >= masterTask.group.assignedUsers.length) {
    await _completeMasterTask(masterTask);
  }
}

async function handleSharedCompletion (groupMemberTask) {
  let masterTask = await Tasks.Task.findOne({
    _id: groupMemberTask.group.taskId,
  }).exec();

  if (!masterTask || !masterTask.group || masterTask.type == 'habit') return;

  if (masterTask.group.sharedCompletion === SHARED_COMPLETION.single) {
    await _deleteOrCompleteUnfinishedTasks(groupMemberTask);
    await _completeMasterTask(masterTask);
  } else if (masterTask.group.sharedCompletion === SHARED_COMPLETION.every) {
    await _evaluateAllAssignedCompletion(masterTask);
  }
}

export {
  SHARED_COMPLETION,
  handleSharedCompletion,
};
