import Bluebird from 'Bluebird';

import { model as Challenges } from '../../website/server/models/challenge';
import { model as User } from '../../website/server/models/user';

async function syncChallengeToMembers (challenges) {
  let challengSyncPromises = challenges.map(async function (challenge) {
    let users = await User.find({
      // _id: '',
      challenges: challenge._id,
    }).exec();

    let promises = [];
    users.forEach(function (user) {
      promises.push(challenge.syncToUser(user));
      promises.push(challenge.save());
      promises.push(user.save());
    });

    return Bluebird.all(promises);
  });

  return await Bluebird.all(challengSyncPromises);
}

async function syncChallenges (lastChallengeDate) {
  let query = {
    // _id: '',
  };

  if (lastChallengeDate) {
    query.createdOn = { $lte: lastChallengeDate };
  }

  let challengesFound = await Challenges.find(query)
    .limit(10)
    .sort('-createdAt')
    .exec();

  let syncedChallenges = await syncChallengeToMembers(challengesFound)
    .catch(reason => console.error(reason));
  let lastChallenge = challengesFound[challengesFound.length - 1];
  if (lastChallenge) syncChallenges(lastChallenge.createdAt);
  return syncedChallenges;
};

module.exports = syncChallenges;
