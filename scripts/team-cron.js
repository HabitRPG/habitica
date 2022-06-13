import forEach from 'lodash/forEach';
import { model as Group } from '../website/server/models/group';
import { model as User } from '../website/server/models/user';
import * as Tasks from '../website/server/models/task';
import { daysSince, shouldDo } from '../website/common/script/cron';

const TASK_VALUE_CHANGE_FACTOR = 0.9747;
const MIN_TASK_VALUE = -47.27;

async function updateTeamTasks (team) {
  const toSave = [];
  let teamLeader = await User.findOne({ _id: team.leader }, 'preferences').exec();

  if (!teamLeader) { // why would this happen?
    teamLeader = {
      preferences: { }, // when options are sanitized this becomes CDS 0 at UTC
    };
  }

  if (
    !team.cron || !team.cron.lastProcessed
    || daysSince(team.cron.lastProcessed, teamLeader.preferences) > 0
  ) {
    const tasks = await Tasks.Task.find({
      'group.id': team._id,
      userId: { $exists: false },
      $or: [
        { type: 'todo', completed: false },
        { type: { $in: ['habit', 'daily'] } },
      ],
    }).exec();

    const tasksByType = {
      habits: [], dailys: [], todos: [], rewards: [],
    };
    forEach(tasks, task => tasksByType[`${task.type}s`].push(task));

    forEach(tasksByType.habits, habit => {
      if (!(habit.up && habit.down) && habit.value !== 0) {
        habit.value *= 0.5;
        if (Math.abs(habit.value) < 0.1) habit.value = 0;
        toSave.push(habit.save());
      }
    });
    forEach(tasksByType.todos, todo => {
      if (!todo.completed) {
        const delta = TASK_VALUE_CHANGE_FACTOR ** todo.value;
        todo.value -= delta;
        if (todo.value < MIN_TASK_VALUE) todo.value = MIN_TASK_VALUE;
        toSave.push(todo.save());
      }
    });
    forEach(tasksByType.dailys, daily => {
      let processChecklist = false;
      let assignments = 0;
      let completions = 0;
      for (const assignedUser in daily.group.assignedUsersDetail) {
        if (Object.prototype.hasOwnProperty.call(daily.group.assignedUsersDetail, assignedUser)) {
          assignments += 1;
          if (daily.group.assignedUsersDetail[assignedUser].completed) {
            completions += 1;
            daily.group.assignedUsersDetail[assignedUser].completed = false;
          }
        }
      }
      if (completions > 0) daily.markModified('group.assignedUsersDetail');
      if (daily.completed) {
        processChecklist = true;
        daily.completed = false;
      } else if (shouldDo(team.cron.lastProcessed, daily, teamLeader.preferences)) {
        processChecklist = true;
        const delta = TASK_VALUE_CHANGE_FACTOR ** daily.value;
        if (assignments > 0) {
          daily.value -= ((completions / assignments) * delta);
        }
        if (daily.value < MIN_TASK_VALUE) daily.value = MIN_TASK_VALUE;
      }
      daily.isDue = shouldDo(new Date(), daily, teamLeader.preferences);
      if (processChecklist && daily.checklist.length > 0) {
        daily.checklist.forEach(i => { i.completed = false; });
      }
      toSave.push(daily.save());
    });

    if (!team.cron) team.cron = {};
    team.cron.lastProcessed = new Date();
    toSave.push(team.save());
  }

  return Promise.all(toSave);
}

export default async function processTeamsCron () {
  const activeTeams = await Group.find({
    'purchased.plan.customerId': { $exists: true },
    $or: [
      { 'purchased.plan.dateTerminated': { $exists: false } },
      { 'purchased.plan.dateTerminated': null },
      { 'purchased.plan.dateTerminated': { $gt: new Date() } },
    ],
  }).exec();

  const cronPromises = activeTeams.map(updateTeamTasks);
  return Promise.all(cronPromises);
}
