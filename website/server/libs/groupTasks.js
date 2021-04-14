import * as Tasks from '../models/task'; // eslint-disable-line import/no-cycle

const SHARED_COMPLETION = {
  default: 'recurringCompletion',
  single: 'singleCompletion',
  every: 'allAssignedCompletion',
};

async function _deleteUnfinishedTasks (groupMemberTask) {
  await Tasks.Task.deleteMany({
    'group.taskId': groupMemberTask.group.taskId,
    $and: [
      { userId: { $exists: true } },
      { userId: { $ne: groupMemberTask.userId } },
    ],
  }).exec();
}

async function handleSharedCompletion (masterTask, groupMemberTask) {
  if (masterTask.type === 'reward') return;
  if (masterTask.type === 'todo') await _deleteUnfinishedTasks(groupMemberTask);
  masterTask.completed = groupMemberTask.completed;
  masterTask.group.completedBy = groupMemberTask.userId;
  await masterTask.save();
}

export {
  SHARED_COMPLETION,
  handleSharedCompletion,
};
