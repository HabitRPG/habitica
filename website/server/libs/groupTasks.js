import * as Tasks from '../models/task'; // eslint-disable-line import/no-cycle

const SHARED_COMPLETION = {
  default: 'recurringCompletion',
  single: 'singleCompletion',
  every: 'allAssignedCompletion',
};

async function _completeMasterTask (masterTask) {
  masterTask.completed = true;
  await masterTask.save();
}

async function _deleteUnfinishedTasks (groupMemberTask) {
  await Tasks.Task.deleteMany({
    'group.taskId': groupMemberTask.group.taskId,
    $and: [
      { userId: { $exists: true } },
      { userId: { $ne: groupMemberTask.userId } },
    ],
  }).exec();
}

async function _evaluateAllAssignedCompletion (masterTask) {
  let completions;
  if (masterTask.group.approval && masterTask.group.approval.required) {
    completions = await Tasks.Task.countDocuments({
      'group.taskId': masterTask._id,
      'group.approval.approved': true,
    }).exec();
    completions += 1;
  } else {
    completions = await Tasks.Task.countDocuments({
      'group.taskId': masterTask._id,
      completed: true,
    }).exec();
  }
  if (completions >= masterTask.group.assignedUsers.length) {
    await _completeMasterTask(masterTask);
  }
}

async function handleSharedCompletion (groupMemberTask) {
  const masterTask = await Tasks.Task.findOne({
    _id: groupMemberTask.group.taskId,
  }).exec();

  if (!masterTask || !masterTask.group || masterTask.type !== 'todo') return;

  if (masterTask.group.sharedCompletion === SHARED_COMPLETION.single) {
    await _deleteUnfinishedTasks(groupMemberTask);
    await _completeMasterTask(masterTask);
  } else if (masterTask.group.sharedCompletion === SHARED_COMPLETION.every) {
    await _evaluateAllAssignedCompletion(masterTask);
  }
}

export {
  SHARED_COMPLETION,
  handleSharedCompletion,
};
