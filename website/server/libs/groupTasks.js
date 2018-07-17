import * as Tasks from '../models/task';

const SHARED_COMPLETION = {
  default: 'individualCompletion',
  single: 'singleCompletion',
  every: 'allAssignedCompletion',
};

async function _completeMasterTask (taskId) {
  await Tasks.Task.update({_id: taskId}, {$set: {completed: true}}).exec();
}

async function _deleteUnfinishedTasks (groupMemberTask) {
  await Tasks.Task.deleteMany({
    'group.taskId': groupMemberTask.group.taskId,
    $and: [
      {userId: {$exists: true}},
      {userId: {$ne: groupMemberTask.userId}},
    ],
  }).exec();
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
    _completeMasterTask(masterTask._id);
  }
}

async function handleSharedCompletion (groupMemberTask) {
  let masterTask = await Tasks.Task.findOne({
    _id: groupMemberTask.group.taskId,
  }).exec();

  if (!masterTask || !masterTask.group || masterTask.type !== 'todo') return;

  if (masterTask.group.sharedCompletion === SHARED_COMPLETION.single) {
    _deleteUnfinishedTasks(groupMemberTask);
    _completeMasterTask(masterTask._id);
  } else if (masterTask.group.sharedCompletion === SHARED_COMPLETION.every) {
    _evaluateAllAssignedCompletion();
  }
}

export {
  SHARED_COMPLETION,
  handleSharedCompletion,
};
