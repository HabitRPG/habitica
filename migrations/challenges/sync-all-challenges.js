import { model as Challenges } from '../../website/server/models/challenge';
import { model as User } from '../../website/server/models/user';

async function syncChallengeToMembers (challenges) {
  const challengSyncPromises = challenges.map(async challenge => {
    const users = await User.find({
      // _id: '',
      challenges: challenge._id,
    }).exec();

    const promises = [];
    users.forEach(user => {
      promises.push(challenge.syncTasksToUser(user));
      promises.push(challenge.save());
      promises.push(user.save());
    });

    return Promise.all(promises);
  });

  return Promise.all(challengSyncPromises);
}

async function syncChallenges (lastChallengeDate) {
  const query = {
    // _id: '',
  };

  if (lastChallengeDate) {
    query.createdOn = { $lte: lastChallengeDate };
  }

  const challengesFound = await Challenges.find(query)
    .limit(10)
    .sort('-createdAt')
    .exec();

  const syncedChallenges = await syncChallengeToMembers(challengesFound)
    .catch(reason => console.error(reason));
  const lastChallenge = challengesFound[challengesFound.length - 1];
  if (lastChallenge) syncChallenges(lastChallenge.createdAt);
  return syncedChallenges;
}

export default syncChallenges;
