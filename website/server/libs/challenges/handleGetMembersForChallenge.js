import _ from 'lodash';
import {
  model as User,
  publicFields as memberFields,
  nameFields,
} from '../../models/user';
import { model as Challenge } from '../../models/challenge';
import { model as Group } from '../../models/group';
import * as Tasks from '../../models/task';
import { NotFound } from '../errors';

async function getMembersTasksForChallenge (members, challenge) {
  const challengeTasks = await Tasks.Task.find({
    userId: { $in: members.map(m => m._id) },
    'challenge.id': challenge._id,
  })
    .select('-tags -checklist') // We don't want to return tags and checklists publicly
    .lean()
    .exec();

  return _.groupBy(challengeTasks, 'userId');
}

export async function handleGetMembersForChallenge (req, res) {
  req.checkParams('challengeId', res.t('challengeIdRequired')).notEmpty().isUUID();
  req.checkQuery('lastId').optional().notEmpty().isUUID();
  // Allow an arbitrary number of results (up to 60)
  req.checkQuery('limit', res.t('groupIdRequired')).optional().notEmpty().isInt({ min: 1, max: 60 });

  const validationErrors = req.validationErrors();
  if (validationErrors) throw validationErrors;

  const { challengeId } = req.params;
  const { lastId } = req.query;
  const { user } = res.locals;

  const challenge = await Challenge.findById(challengeId).select('_id type leader group').exec();
  if (!challenge) throw new NotFound(res.t('challengeNotFound'));

  // optionalMembership is set to true because even
  // if you're not member of the group you may be able to access the challenge
  // for example if you've been booted from it, are the leader or a site admin
  const group = await Group.getGroup({
    user,
    groupId: challenge.group,
    fields: '_id type privacy',
    optionalMembership: true,
  });

  if (!group || !challenge.canView(user, group)) throw new NotFound(res.t('challengeNotFound'));

  const query = {};
  let fields = nameFields;
  // add computes stats to the member info when items and stats are available
  let addComputedStats = false;
  query.challenges = challenge._id;

  if (req.query.includeAllPublicFields === 'true') {
    fields = memberFields;
    addComputedStats = true;
  }

  if (req.query.search) {
    query['auth.local.username'] = { $regex: req.query.search };
  }

  if (lastId) query._id = { $gt: lastId };

  const limit = req.query.limit ? Number(req.query.limit) : 30;

  const members = await User
    .find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .select(fields)
    .lean()
    .exec();

  const includeTasks = req.query.includeTasks === 'true';
  let memberIdToTasksMap;
  if (includeTasks) {
    memberIdToTasksMap = await getMembersTasksForChallenge(members, challenge);
  }

  members.forEach(member => {
    User.transformJSONUser(member, addComputedStats);
    if (includeTasks) member.tasks = memberIdToTasksMap[member._id];
  });
  res.respond(200, members);
}
