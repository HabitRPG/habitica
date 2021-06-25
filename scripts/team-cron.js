import forEach from 'lodash/forEach';
import { model as Group } from '../website/server/models/group';
import { model as User } from '../website/server/models/user';
import * as Tasks from '../website/server/models/task';
import { daysSince, shouldDo } from '../website/common/script/cron';

const TASK_VALUE_CHANGE_FACTOR = 0.9747;
const MIN_TASK_VALUE = -47.27;

async function updateTeamTasks (team) {
  const toSave = [];
  const teamLeader = await User.findOne({ _id: team.leader }, 'preferences').exec();

  if (
    !team.cron || !team.cron.lastProcessed
    || daysSince(team.cron.lastProcessed, teamLeader.preferences) > 0
  ) {
    const tasks = await Tasks.Task.find({
      'group.id': team._id,
      'group.assignedUsers': [],
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
      if (daily.completed) {
        daily.completed = false;
      } else if (shouldDo(team.cron.lastProcessed, daily, teamLeader.preferences)) {
        const delta = TASK_VALUE_CHANGE_FACTOR ** daily.value;
        daily.value -= delta;
        if (daily.value < MIN_TASK_VALUE) daily.value = MIN_TASK_VALUE;
      }
      daily.isDue = shouldDo(new Date(), daily, teamLeader.preferences);
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
