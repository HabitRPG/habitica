import filter from 'lodash/filter';
import find from 'lodash/find';
import isArray from 'lodash/isArray';
import { model as Group } from '../../website/server/models/group';
import { model as User } from '../../website/server/models/user';
import * as Tasks from '../../website/server/models/task';

async function updateTeamTasks (team) {
  const toSave = [];
  const teamTasks = await Tasks.Task.find({
    'group.id': team._id,
  }).exec();

  const teamBoardTasks = filter(teamTasks, task => !task.userId);
  const teamUserTasks = filter(teamTasks, task => task.userId);

  for (const boardTask of teamBoardTasks) {
    if (isArray(boardTask.group.assignedUsers)) {
      boardTask.group.approval = undefined;
      boardTask.group.assignedDate = undefined;
      boardTask.group.assigningUsername = undefined;
      boardTask.group.sharedCompletion = undefined;

      for (const assignedUserId of boardTask.group.assignedUsers) {
        const assignedUser = await User.findById(assignedUserId, 'auth'); // eslint-disable-line no-await-in-loop
        const userTask = find(teamUserTasks, task => task.userId === assignedUserId
           && task.group.taskId === boardTask._id);
        if (!boardTask.group.assignedUsersDetail) boardTask.group.assignedUsersDetail = {};
        if (userTask && assignedUser) {
          boardTask.group.assignedUsersDetail[assignedUserId] = {
            assignedDate: userTask.group.assignedDate,
            assignedUsername: assignedUser.auth.local.username,
            assigningUsername: userTask.group.assigningUsername,
            completed: userTask.completed || false,
            completedDate: userTask.dateCompleted,
          };
        } else if (assignedUser) {
          boardTask.group.assignedUsersDetail[assignedUserId] = {
            assignedDate: new Date(),
            assignedUsername: assignedUser.auth.local.username,
            assigningUsername: null,
            completed: false,
            completedDate: null,
          };
        } else {
          const taskIndex = boardTask.group.assignedUsers.indexOf(assignedUserId);
          boardTask.group.assignedUsers.splice(taskIndex, 1);
        }
        if (userTask) toSave.push(Tasks.Task.findByIdAndDelete(userTask._id));
      }
      boardTask.markModified('group');
      toSave.push(boardTask.save());
    }
  }

  return Promise.all(toSave);
}

export default async function processTeams () {
  const activeTeams = await Group.find({
    'purchased.plan.customerId': { $exists: true },
    $or: [
      { 'purchased.plan.dateTerminated': { $exists: false } },
      { 'purchased.plan.dateTerminated': null },
      { 'purchased.plan.dateTerminated': { $gt: new Date() } },
    ],
  }).exec();

  const taskPromises = activeTeams.map(updateTeamTasks);
  return Promise.all(taskPromises);
}
