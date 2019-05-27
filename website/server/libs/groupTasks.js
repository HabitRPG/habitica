import * as Tasks from '../models/task';
import {model as Groups} from '../models/group';
import {model as Users} from '../models/user/index';

const SHARED_COMPLETION = {
  default: 'recurringCompletion',
  single: 'singleCompletion',
  every: 'allAssignedCompletion',
};

// @TODO Group task scoring
async function _completeOrUncompleteMasterTask (masterTask, completed) {
  masterTask.completed = completed;
  await masterTask.save();
}

async function _updateAssignedUsersTasks (masterTask, groupMemberTask) {
  if (groupMemberTask.type === 'todo') {
    if (groupMemberTask.completed || groupMemberTask.group.approval && groupMemberTask.group.approval.approved) {
      // The task was done by one person and is removed from others' lists
      await Tasks.Task.deleteMany({
        'group.taskId': groupMemberTask.group.taskId,
        $and: [
          {userId: {$exists: true}},
          {userId: {$ne: groupMemberTask.userId}},
        ],
      }).exec();
    } else {
      // The task was uncompleted by the group member and should be recreated for assignedUsers
      let group = await Groups.findById(masterTask.group.id).exec();
      let userList = [];
      masterTask.group.assignedUsers.forEach(userId => {
        let query = {_id: userId};
        userList.push(query);
      });
      await Users.find({
        $or: userList,
      }).then(async assignedUsers => {
        for (const assignedUser of assignedUsers) {
          let promises = [];
          promises.push(group.syncTask(masterTask, assignedUser));
          promises.push(group.save());
          await Promise.all(promises);
        }
      });
    }
  } else {
    // Complete or uncomplete the task on other users' lists
    await Tasks.Task.find({
      'group.taskId': groupMemberTask.group.taskId,
      $and: [
        {userId: {$exists: true}},
        {userId: {$ne: groupMemberTask.userId}}
      ]}).then(tasks => {
        tasks.forEach(task => {
          // Adjust the task's completion to match the groupMemberTask
          // Completed or notDue dailies have little effect at cron (MP replenishment for completed dailies)
          // This maintain's the user's streak without scoring the task if someone else completed the task
          // If no assignedUser completes the due daily, all users lose their streaks at their cron
          // @TODO Should we break their streaks or increase their value to encourage competition for the daily?
          task.completed = groupMemberTask.completed || groupMemberTask.group.approval && groupMemberTask.group.approval.approved;
          task.save();
        });
      });
  }
}

async function _evaluateAllAssignedCompletion (masterTask, groupMemberTask) {
  let completions;
  if (masterTask.group.approval && masterTask.group.approval.required) {
    completions = await Tasks.Task.count({
      'group.taskId': masterTask._id,
      'group.approval.approved': true,
    }).exec();
    // Since an approval is not yet saved into the group member task, count it
    // But do not recount a group member completing an already approved task
    if (!groupMemberTask.completed) completions++;
  } else {
    completions = await Tasks.Task.count({
      'group.taskId': masterTask._id,
      completed: true,
    }).exec();
  }
  await _completeOrUncompleteMasterTask(masterTask, completions >= masterTask.group.assignedUsers.length);
}

async function handleSharedCompletion (groupMemberTask) {
  let masterTask = await Tasks.Task.findOne({
    _id: groupMemberTask.group.taskId,
  }).exec();

  if (!masterTask || !masterTask.group || masterTask.type === 'habit') return;

  if (masterTask.group.sharedCompletion === SHARED_COMPLETION.single) {
    await _updateAssignedUsersTasks(masterTask, groupMemberTask);
    await _completeOrUncompleteMasterTask(masterTask, groupMemberTask.completed || groupMemberTask.group.approval && groupMemberTask.group.approval.approved);
  } else if (masterTask.group.sharedCompletion === SHARED_COMPLETION.every) {
    await _evaluateAllAssignedCompletion(masterTask, groupMemberTask);
  }
}

export {
  SHARED_COMPLETION,
  handleSharedCompletion,
};
