import Bluebird from 'bluebird';

import { model as User } from '../models/user';
import * as Tasks from '../models/task';
import {
  NotFound,
  BadRequest,
} from './errors';

async function castTaskSpell (res, req, targetId, user, spell) {
  if (!targetId) throw new BadRequest(res.t('targetIdUUID'));

  const task = await Tasks.Task.findOne({
    _id: targetId,
    userId: user._id,
  }).exec();
  if (!task) throw new NotFound(res.t('taskNotFound'));
  if (task.challenge.id) throw new BadRequest(res.t('challengeTasksNoCast'));
  if (task.group.id) throw new BadRequest(res.t('groupTasksNoCast'));

  spell.cast(user, task, req);

  const results = await Bluebird.all([
    user.save(),
    task.save(),
  ]);

  return results;
}

async function castMultiTaskSpell (req, user, spell) {
  const tasks = await Tasks.Task.find({
    userId: user._id,
    ...Tasks.taskIsGroupOrChallengeQuery,
  }).exec();

  spell.cast(user, tasks, req);

  const toSave = tasks
    .filter(t => t.isModified())
    .map(t => t.save());
  toSave.unshift(user.save());
  const saved = await Bluebird.all(toSave);

  const response = {
    tasks: saved,
    user,
  };

  return response;
}

async function castSelfSpell (req, user, spell) {
  spell.cast(user, null, req);
  await user.save();
}

async function castPartySpell (req, party, partyMembers, user, spell) {
  if (!party) {
    partyMembers = [user]; // Act as solo party
  } else {
    partyMembers = await User
      .find({
        'party._id': party._id,
        _id: { $ne: user._id }, // add separately
      })
      // .select(partyMembersFields) Selecting the entire user because otherwise when saving it'll save
      // default values for non-selected fields and pre('save') will mess up thinking some values are missing
      .exec();

    partyMembers.unshift(user);
  }

  spell.cast(user, partyMembers, req);
  await Bluebird.all(partyMembers.map(m => m.save()));

  return partyMembers;
}

async function castUserSpell (res, req, party, partyMembers, targetId, user, spell) {
  if (!party && (!targetId || user._id === targetId)) {
    partyMembers = user;
  } else {
    if (!targetId) throw new BadRequest(res.t('targetIdUUID'));
    if (!party) throw new NotFound(res.t('partyNotFound'));
    partyMembers = await User
      .findOne({_id: targetId, 'party._id': party._id})
      // .select(partyMembersFields) Selecting the entire user because otherwise when saving it'll save
      // default values for non-selected fields and pre('save') will mess up thinking some values are missing
      .exec();
  }

  if (!partyMembers) throw new NotFound(res.t('userWithIDNotFound', {userId: targetId}));

  spell.cast(user, partyMembers, req);

  if (partyMembers !== user) {
    await Bluebird.all([
      user.save(),
      partyMembers.save(),
    ]);
  } else {
    await partyMembers.save(); // partyMembers is user
  }

  return partyMembers;
}

export {castTaskSpell, castMultiTaskSpell, castSelfSpell, castPartySpell, castUserSpell};
