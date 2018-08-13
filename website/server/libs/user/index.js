import common from '../../../common';
import * as Tasks from '../../models/task';

export async function reset (req, res, { isV3 = false }) {
  const user = res.locals.user;

  const tasks = await Tasks.Task.find({
    userId: user._id,
    ...Tasks.taskIsGroupOrChallengeQuery,
  }).select('_id type challenge group').exec();

  const resetRes = common.ops.reset(user, tasks);
  if (isV3) {
    resetRes[0].user = await resetRes[0].user.toJSONWithInbox();
  }

  await Promise.all([
    Tasks.Task.remove({_id: {$in: resetRes[0].tasksToRemove}, userId: user._id}),
    user.save(),
  ]);

  res.analytics.track('account reset', {
    uuid: user._id,
    hitType: 'event',
    category: 'behavior',
  });

  res.respond(200, ...resetRes);
}

export async function reroll (req, res, { isV3 = false }) {
  let user = res.locals.user;
  let query = {
    userId: user._id,
    type: {$in: ['daily', 'habit', 'todo']},
    ...Tasks.taskIsGroupOrChallengeQuery,
  };
  let tasks = await Tasks.Task.find(query).exec();
  const rerollRes = common.ops.reroll(user, tasks, req, res.analytics);
  if (isV3) {
    rerollRes[0].user = await rerollRes[0].user.toJSONWithInbox();
  }

  let promises = tasks.map(task => task.save());
  promises.push(user.save());

  await Promise.all(promises);

  res.respond(200, ...rerollRes);
}

export async function rebirth (req, res, { isV3 = false }) {
  const user = res.locals.user;
  const tasks = await Tasks.Task.find({
    userId: user._id,
    type: {$in: ['daily', 'habit', 'todo']},
    ...Tasks.taskIsGroupOrChallengeQuery,
  }).exec();

  const rebirthRes = common.ops.rebirth(user, tasks, req, res.analytics);
  if (isV3) {
    rebirthRes[0].user = await rebirthRes[0].user.toJSONWithInbox();
  }

  const toSave = tasks.map(task => task.save());

  toSave.push(user.save());

  await Promise.all(toSave);

  res.respond(200, ...rebirthRes);
}