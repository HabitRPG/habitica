import _ from 'lodash';
import common from '../../../common';
import * as Tasks from '../../models/task';
import {
  BadRequest,
  NotAuthorized,
} from '../errors';
import { model as User, schema as UserSchema } from '../../models/user';
import { nameContainsSlur, nameContainsNewline } from './validation';

export async function get (req, res, { isV3 = false }) {
  const { user } = res.locals;
  let userToJSON;

  if (isV3) {
    userToJSON = await user.toJSONWithInbox();
  } else {
    userToJSON = user.toJSON();
  }

  // Remove apiToken from response TODO make it private at the user level? returned in signup/login
  delete userToJSON.apiToken;

  if (!req.query.userFields) {
    const { daysMissed } = user.daysUserHasMissed(new Date(), req);
    userToJSON.needsCron = false;
    if (daysMissed > 0) userToJSON.needsCron = true;
    User.addComputedStatsToJSONObj(userToJSON.stats, userToJSON);
  }

  return res.respond(200, userToJSON);
}

const updatablePaths = [
  '_ABtests.counter',

  'flags.customizationsNotification',
  'flags.showTour',
  'flags.tour',
  'flags.tutorial',
  'flags.communityGuidelinesAccepted',
  'flags.welcomed',
  'flags.cardReceived',
  'flags.warnedLowHealth',
  'flags.newStuff',

  'achievements',

  'party.order',
  'party.orderAscending',
  'party.quest.completed',
  'party.quest.RSVPNeeded',

  'preferences',
  'profile',
  'stats',
  'inbox.optOut',
  'tags',
];

// This tells us for which paths users can call `PUT /user`.
// The trick here is to only accept leaf paths, not root/intermediate paths (see http://goo.gl/OEzkAs)
const acceptablePUTPaths = _.reduce(UserSchema.paths, (accumulator, val, leaf) => {
  const found = _.find(updatablePaths, rootPath => leaf.indexOf(rootPath) === 0);

  if (found) accumulator[leaf] = true;

  return accumulator;
}, {});

const restrictedPUTSubPaths = [
  'stats.class',

  'preferences.disableClasses',
  'preferences.sleep',
  'preferences.webhooks',
];

_.each(restrictedPUTSubPaths, removePath => {
  delete acceptablePUTPaths[removePath];
});

const requiresPurchase = {
  'preferences.background': 'background',
  'preferences.shirt': 'shirt',
  'preferences.size': 'size',
  'preferences.skin': 'skin',
  'preferences.hair.bangs': 'hair.bangs',
  'preferences.hair.base': 'hair.base',
  'preferences.hair.beard': 'hair.beard',
  'preferences.hair.color': 'hair.color',
  'preferences.hair.flower': 'hair.flower',
  'preferences.hair.mustache': 'hair.mustache',
};

function checkPreferencePurchase (user, path, item) {
  const itemPath = `${path}.${item}`;
  const appearance = _.get(common.content.appearances, itemPath);
  if (!appearance) return false;
  if (appearance.price === 0) return true;

  return _.get(user.purchased, itemPath);
}

export async function update (req, res, { isV3 = false }) {
  const { user } = res.locals;

  let promisesForTagsRemoval = [];

  if (req.body['profile.name'] !== undefined) {
    const newName = req.body['profile.name'];
    if (newName === null) throw new BadRequest(res.t('invalidReqParams'));
    if (newName.length > 30) throw new BadRequest(res.t('displaynameIssueLength'));
    if (nameContainsSlur(newName)) throw new BadRequest(res.t('displaynameIssueSlur'));
    if (nameContainsNewline(newName)) throw new BadRequest(res.t('displaynameIssueNewline'));
  }

  _.each(req.body, (val, key) => {
    const purchasable = requiresPurchase[key];

    if (purchasable && !checkPreferencePurchase(user, purchasable, val)) {
      throw new NotAuthorized(res.t('mustPurchaseToSet', { val, key }));
    }

    if (acceptablePUTPaths[key] && key !== 'tags') {
      _.set(user, key, val);
    } else if (key === 'tags') {
      if (!Array.isArray(val)) throw new BadRequest('mustBeArray');

      const removedTagsIds = [];

      const oldTags = [];

      // Keep challenge and group tags
      user.tags.forEach(t => {
        if (t.group) {
          oldTags.push(t);
        } else {
          removedTagsIds.push(t.id);
        }
      });

      user.tags = oldTags;

      val.forEach(t => {
        const oldI = removedTagsIds.findIndex(id => id === t.id);
        if (oldI > -1) {
          removedTagsIds.splice(oldI, 1);
        }

        user.tags.push(t);
      });

      // Remove from all the tasks
      // NOTE each tag to remove requires a query

      promisesForTagsRemoval = removedTagsIds.map(tagId => Tasks.Task.update({
        userId: user._id,
      }, {
        $pull: {
          tags: tagId,
        },
      }, { multi: true }).exec());
    } else {
      throw new NotAuthorized(res.t('messageUserOperationProtected', { operation: key }));
    }
  });

  await Promise.all([user.save()].concat(promisesForTagsRemoval));

  let userToJSON = user;

  if (isV3) userToJSON = await user.toJSONWithInbox();

  return res.respond(200, userToJSON);
}

export async function reset (req, res, { isV3 = false }) {
  const { user } = res.locals;

  const tasks = await Tasks.Task.find({
    userId: user._id,
    ...Tasks.taskIsGroupOrChallengeQuery,
  }).select('_id type challenge group').exec();

  const resetRes = common.ops.reset(user, tasks);
  if (isV3) {
    resetRes[0].user = await resetRes[0].user.toJSONWithInbox();
  }

  await Promise.all([
    Tasks.Task.remove({ _id: { $in: resetRes[0].tasksToRemove }, userId: user._id }),
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
  const { user } = res.locals;
  const query = {
    userId: user._id,
    type: { $in: ['daily', 'habit', 'todo'] },
    ...Tasks.taskIsGroupOrChallengeQuery,
  };
  const tasks = await Tasks.Task.find(query).exec();
  const rerollRes = common.ops.reroll(user, tasks, req, res.analytics);
  if (isV3) {
    rerollRes[0].user = await rerollRes[0].user.toJSONWithInbox();
  }

  const promises = tasks.map(task => task.save());
  promises.push(user.save());

  await Promise.all(promises);

  res.respond(200, ...rerollRes);
}

export async function rebirth (req, res, { isV3 = false }) {
  const { user } = res.locals;
  const tasks = await Tasks.Task.find({
    userId: user._id,
    type: { $in: ['daily', 'habit', 'todo'] },
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
