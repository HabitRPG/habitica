import _ from 'lodash';
import common from '../../../common';
import * as Tasks from '../../models/task';
import { model as Groups } from '../../models/group';
import {
  BadRequest,
  NotAuthorized,
} from '../errors';
import { model as User, schema as UserSchema } from '../../models/user';
import { model as NewsPost } from '../../models/newsPost';
import { stringContainsProfanity, nameContainsNewline } from './validation';

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

  'achievements',

  'party.order',
  'party.orderAscending',
  'party.quest.completed',
  'party.quest.RSVPNeeded',
  'party.seeking',

  'preferences',
  'profile',
  'stats',
  'inbox.optOut',
];

// This tells us for which paths users can call `PUT /user`.
// The trick here is to only accept leaf paths, not root/intermediate paths (see https://goo.gl/OEzkAs)
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
  if (appearance.price === 0 && path !== 'background') {
    return true;
  }

  return _.get(user.purchased, itemPath);
}

async function checkNewInputForProfanity (user, res, newValue) {
  const containsSlur = stringContainsProfanity(newValue, 'slur');
  const containsBannedWord = stringContainsProfanity(newValue);
  if (containsSlur || containsBannedWord) {
    if (containsSlur) {
      user.flags.chatRevoked = true;
      await user.save();
      throw new BadRequest(res.t('bannedSlurUsedInProfile'));
    }
    throw new BadRequest(res.t('bannedWordUsedInProfile'));
  }
}

export async function update (req, res, { isV3 = false }) {
  const { user } = res.locals;

  let promisesForTagsRemoval = [];

  if (req.body['party.seeking'] !== undefined && req.body['party.seeking'] !== null) {
    user.invitations.party = {};
    user.invitations.parties = [];
    res.analytics.track('Starts Looking for Party', {
      uuid: user._id,
      hitType: 'event',
      category: 'behavior',
      headers: req.headers,
    });
  }

  if (req.body['profile.name'] !== undefined) {
    const newName = req.body['profile.name'];
    if (newName === null) throw new BadRequest(res.t('invalidReqParams'));
    if (newName.length > 30) throw new BadRequest(res.t('displaynameIssueLength'));
    if (nameContainsNewline(newName)) throw new BadRequest(res.t('displaynameIssueNewline'));
    await checkNewInputForProfanity(user, res, newName);
  }

  if (req.body['profile.blurb'] !== undefined) {
    const newBlurb = req.body['profile.blurb'];
    await checkNewInputForProfanity(user, res, newBlurb);
  }

  if (req.body['preferences.tasks.mirrorGroupTasks'] !== undefined) {
    const groupsToMirror = req.body['preferences.tasks.mirrorGroupTasks'];
    if (!Array.isArray(groupsToMirror)) {
      throw new BadRequest('Groups to copy tasks from must be an array.');
    }
    const memberGroups = _.clone(user.guilds);
    if (user.party._id) memberGroups.push(user.party._id);
    for (const targetGroup of groupsToMirror) {
      if (memberGroups.indexOf(targetGroup) === -1) {
        throw new BadRequest(`User not a member of group ${targetGroup}.`);
      }
    }

    const matchingGroupsCount = await Groups.countDocuments({
      _id: { $in: groupsToMirror },
      'purchased.plan.customerId': { $exists: true },
      $or: [
        { 'purchased.plan.dateTerminated': { $exists: false } },
        { 'purchased.plan.dateTerminated': null },
        { 'purchased.plan.dateTerminated': { $gt: new Date() } },
      ],
    }).exec();

    if (matchingGroupsCount !== groupsToMirror.length) {
      throw new BadRequest('Groups to copy tasks from must have subscriptions.');
    }
  }

  _.each(req.body, (val, key) => {
    const purchasable = requiresPurchase[key];

    if (purchasable && !checkPreferencePurchase(user, purchasable, val)) {
      throw new NotAuthorized(res.t('mustPurchaseToSet', { val, key }));
    }

    if (key === 'party.seeking' && val === null) {
      user.party.seeking = undefined;
      res.analytics.track('Leaves Looking for Party', {
        uuid: user._id,
        hitType: 'event',
        category: 'behavior',
        headers: req.headers,
      });
    } else if (key === 'tags') {
      if (!Array.isArray(val)) throw new BadRequest('Tag list must be an array.');

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

      promisesForTagsRemoval = removedTagsIds.map(tagId => Tasks.Task.updateMany({
        userId: user._id,
      }, {
        $pull: {
          tags: tagId,
        },
      }).exec());
    } else if (key === 'flags.newStuff' && val === false) {
      // flags.newStuff was removed from the user schema and is only returned for compatibility
      // reasons but we're keeping the ability to set it in API v3
      const lastNewsPost = NewsPost.lastNewsPost();
      if (lastNewsPost) {
        user.flags.lastNewStuffRead = lastNewsPost._id;
      }
    } else if (acceptablePUTPaths[key]) {
      let adjustedVal = val;
      if (key === 'stats.lvl' && val > common.constants.MAX_LEVEL_HARD_CAP) {
        adjustedVal = common.constants.MAX_LEVEL_HARD_CAP;
      }
      _.set(user, key, adjustedVal);
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
    headers: req.headers,
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
  const rerollRes = await common.ops.reroll(user, tasks, req, res.analytics);
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

  const rebirthRes = await common.ops.rebirth(user, tasks, req, res.analytics);
  if (isV3) {
    rebirthRes[0].user = await rebirthRes[0].user.toJSONWithInbox();
  }

  const toSave = tasks.map(task => task.save());

  toSave.push(user.save());

  await Promise.all(toSave);

  res.respond(200, ...rebirthRes);
}
