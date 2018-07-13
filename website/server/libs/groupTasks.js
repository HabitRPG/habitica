import * as Tasks from '../models/task';

async function handleSharedCompletion (groupMemberTask) {
  let masterTask = await Tasks.Task.findOne({
    _id: groupMemberTask.group.taskId,
  }).exec();

  if (!masterTask || !masterTask.group || masterTask.type !== 'todo') return undefined;

  if (masterTask.group.sharedCompletion === 'singleCompletion') {
    await Tasks.Task.deleteMany({
      'group.taskId': groupMemberTask.group.taskId,
      $and: [
        {userId: {$exists: true}},
        {userId: {$ne: groupMemberTask.userId}},
      ],
    }).exec();

    masterTask.completed = true;
    return masterTask;
  } else if (masterTask.group.sharedCompletion === 'allAssignedCompletion') {
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
      masterTask.completed = true;
      return masterTask;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

export {handleSharedCompletion};
