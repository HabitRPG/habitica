import Bluebird from 'Bluebird';

import { model as Challenges } from '../../website/server/models/challenge';
import { model as User } from '../../website/server/models/user';

async function syncChallengeToMembers (challenges) {
  challenges.forEach(async function (challenge) {
    let users = await User.find({challenges: challenge._id}).exec();

    users.forEach(async function (user) {
      let promises = [];

      promises.push(challenge.syncToUser(user));
      promises.push(challenge.save());
      promises.push(user.save());

      await Bluebird.all(promises);
    });
  });

  return challenges;
}

async function syncChallenges (lastChallengeDate) {
  let query = {};

  if (lastChallengeDate) {
    query.createdOn = { $lte: lastChallengeDate };
  }

  await Challenges.find(query)
    .limit(10)
    .sort('-createdAt')
    .exec()
    .then(async function (challengesFound) {
      let syncedChallenges = await syncChallengeToMembers(challengesFound);
      let lastChallenge = challengesFound[challengesFound.length - 1];
      if (lastChallenge) syncChallenges(lastChallenge.createdAt);
      return syncedChallenges;
    });
};

module.exports = async function syncAllChallenges() {
  await syncChallenges();
};
