import * as Tasks from '../models/task';
import {model as Groups} from '../models/group';
import {model as Users} from '../models/user/index';
import moment from "moment";
import {InternalServerError} from "./errors";

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
      const assignedUsers = await Users.find({
        $or: userList,
      });
      await Promise.all(assignedUsers.map(assignedUser => {
        return group.syncTask(masterTask, assignedUser);
      }));
      await group.save();
    }
  } else if (groupMemberTask.type === 'daily') {
    // Adjust the task's completion to match the groupMemberTask
    // Completed or notDue dailies have little effect at cron (MP replenishment for completed dailies)
    // This maintain's the user's streak without scoring the task if someone else completed the task
    // If no assignedUser completes the due daily, all users lose their streaks at their cron
    // @TODO Should we break their streaks or increase their value to encourage competition for the daily?

    // Get the linked Tasks and the assigned Users
    let tasksQuery = {
      'group.taskId': groupMemberTask.group.taskId,
      'userId': {$exists: true},
    };
    let assignedUsersQuery = {
      $and: [
        {
          '_id': {$in: masterTask.group.assignedUsers},
        },
        {
          '_id': {$ne: groupMemberTask.userId},
        },
      ],
    };
    let groupMemberQuery = groupMemberTask.userId;
    let [tasks, assignedUsers, groupMember] = await Promise.all([
      Tasks.Task.find(tasksQuery),
      Users.find(assignedUsersQuery),
      Users.findById(groupMemberQuery)
    ]);

    // Determine task un/completion day based on groupMember's timezone and CDS
    // For approval required tasks, this file treats approval as completion for users other than the completing user
    // This protects other users who won't do the task if the completing user decides to uncomplete after approval
    // TODO This is poor logic. Some design could be done for uncompleting approved tasks behavior
    let approvalRequired = groupMemberTask.group.approval && groupMemberTask.group.approval.required;
    let approved = groupMemberTask.group.approval && groupMemberTask.group.approval.approved;
    let taskDate = moment();
    if (!approvalRequired) {
      // Happened on user history or "now" for unchecking
      // If we ever come here from via cron scoring down, we will have to recalculate
      taskDate = groupMemberTask.completed ? moment(groupMemberTask.history[groupMemberTask.history.length - 1].date) : taskDate;
    } else if (approved) {
      // If approved, mark task on approval.requestedDate
      taskDate = moment(groupMemberTask.approval.requestedDate);
    } else {
      throw new InternalServerError('Cannot handle shared completion for unapproved tasks requiring approval');
    }
    // Base "day" on group member's tz and dayStart
    let taskDay = moment(taskDate).subtract({
      minutes: groupMember.preferences.tz,
      hours: groupMember.preferences.dayStart,
    }).startOf('day');

    let promises = [];
    assignedUsers.map(user => {
      // Determine user's "current" day
      let userDay = moment().subtract({
        minutes: user.preferences.tz,
        hours: user.preferences.dayStart,
      }).startOf('day');
      if (userDay.isSame(taskDay)) {
        // The group member modified task completion in the "same" day as this user
        // Set the user's task.completed to group member's completed or approved
        // XXX Check whether user has already cron'd today
        let task = tasks.find(task => { return task.userId === user.id });
        task.completed = groupMemberTask.completed || approved;
        promises.push(task.save());
      }
    });

    if (groupMemberTask.completed || approved) {
      // Save history entry to the masterTask
      masterTask.history = masterTask.history || [];
      let historyEntry = {
        date: Number(now),
        value: masterTask.value,
        userId: groupMemberTask.userId,
      };
      masterTask.history.push(historyEntry);
    } else if (!groupMemberTask.completed && !approvalRequired) {
      // Loop backwards through the history and splice out the user's last entry
      if (masterTask.history && masterTask.history.length > 0) {
        for (let i = masterTask.history.length - 1; i >= 0; i--) {
          if (masterTask.history[i].userId === groupMemberTask.userId) {
            masterTask.history.splice(i, 1);
            break;
          }
        }
      }
    }

    await Promise.all(promises);
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
