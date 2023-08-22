// Currently this holds helpers for challenge api,
// but we should break this up into submodules as it expands
import omit from 'lodash/omit';
import { v4 as uuid } from 'uuid';
import { model as Challenge } from '../../models/challenge';
import {
  model as Group,
  TAVERN_ID,
} from '../../models/group';
import {
  BadRequest,
  NotFound,
  NotAuthorized,
} from '../errors';

const TASK_KEYS_TO_REMOVE = [
  '_id', 'completed', 'dateCompleted', 'history',
  'id', 'streak', 'createdAt', 'challenge',
];

export function addUserJoinChallengeNotification (user) {
  if (user.achievements.joinedChallenge) return;
  user.achievements.joinedChallenge = true;
  user.addNotification('CHALLENGE_JOINED_ACHIEVEMENT');
}

export function getChallengeGroupResponse (group) {
  return {
    _id: group._id,
    name: group.name,
    type: group.type,
    privacy: group.privacy,
  };
}

export async function createChallenge (user, req, res) {
  const groupId = req.body.group;
  const { prize } = req.body;

  const group = await Group.getGroup({
    user, groupId, fields: '-chat', mustBeMember: true,
  });
  if (!group) throw new NotFound(res.t('groupNotFound'));
  if (!group.isMember(user)) throw new NotAuthorized(res.t('mustBeGroupMember'));
  if (group.type === 'guild' && group._id !== TAVERN_ID && !group.hasActiveGroupPlan()) {
    throw new BadRequest(res.t('featureRetired'));
  }

  if (group.leaderOnly && group.leaderOnly.challenges && group.leader !== user._id) {
    throw new NotAuthorized(res.t('onlyGroupLeaderChal'));
  }

  if (group._id === TAVERN_ID && prize < 1) {
    throw new NotAuthorized(res.t('tavChalsMinPrize'));
  }

  group.challengeCount += 1;

  if (!req.body.summary) {
    req.body.summary = req.body.name;
  }
  req.body.leader = user._id;
  req.body.official = !!(user.hasPermission('challengeAdmin') && req.body.official);
  const challenge = new Challenge(Challenge.sanitize(req.body));

  // First validate challenge so we don't save group if it's invalid (only runs sync validators)
  const challengeValidationErrors = challenge.validateSync();
  if (challengeValidationErrors) throw challengeValidationErrors;

  if (prize > 0) {
    const groupBalance = group.balance && group.leader === user._id ? group.balance : 0;
    const prizeCost = prize / 4;

    if (prizeCost > user.balance + groupBalance) {
      throw new NotAuthorized(res.t('cantAfford'));
    }

    if (groupBalance >= prizeCost) {
      // Group pays for all of prize
      group.balance -= prizeCost;

      await user.updateBalance(0, 'create_bank_challenge', challenge._id, challenge.name);
    } else if (groupBalance > 0) {
      // User pays remainder of prize cost after group
      const remainder = prizeCost - group.balance;
      group.balance = 0;
      await user.updateBalance(-remainder, 'create_challenge', challenge._id, challenge.name);
    } else {
      // User pays for all of prize
      await user.updateBalance(-prizeCost, 'create_challenge', challenge._id, challenge.name);
    }
  }

  const results = await Promise.all([challenge.save({
    validateBeforeSave: false, // already validated
  }), group.save(), user.save()]);
  const savedChal = results[0];

  return { savedChal, group };
}

export function cleanUpTask (task) {
  const cleansedTask = omit(task, TASK_KEYS_TO_REMOVE);

  // Copy checklists but reset to uncomplete and assign new id
  if (!cleansedTask.checklist) cleansedTask.checklist = [];
  cleansedTask.checklist.forEach(item => {
    item.completed = false;
    item.id = uuid();
  });

  if (cleansedTask.type !== 'reward') {
    delete cleansedTask.value;
  }

  return cleansedTask;
}

// Create an aggregation query for querying challenges.
// Ensures that official challenges are listed first.
export function createChallengeQuery (query) {
  return Challenge.aggregate()
    .match(query)
    .addFields({
      isOfficial: {
        $cond: {
          if: { $isArray: '$categories' },
          then: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$categories',
                    as: 'cat',
                    cond: {
                      $eq: ['$$cat.slug', 'habitica_official'],
                    },
                  },
                },
              },
              0,
            ],
          },
          else: false,
        },
      },
    })
    .sort('-isOfficial -createdAt');
}
