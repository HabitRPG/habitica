/*
const migrationName = 'AchievementRestore';
const authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
const authorUuid = ''; // ... own data is done
*/

/*
 * This migraition will copy user data from prod to test
 */

const monk = require('monk');

const connectionString = 'mongodb://localhost/new-habit';
const Users = monk(connectionString).get('users', { castIds: false });

const oldConnectionSting = 'mongodb://localhost/old-habit';
const UsersOld = monk(oldConnectionSting).get('users', { castIds: false });

function getAchievementUpdate (newUser, oldUser) {
  const oldAchievements = oldUser.achievements;
  const newAchievements = newUser.achievements;

  const achievementsUpdate = { ...newAchievements };

  // ultimateGearSets
  if (!achievementsUpdate.ultimateGearSets && oldAchievements.ultimateGearSets) {
    achievementsUpdate.ultimateGearSets = oldAchievements.ultimateGearSets;
  } else if (oldAchievements.ultimateGearSets) {
    for (const index in oldAchievements.ultimateGearSets) {
      if (oldAchievements.ultimateGearSets[index]) achievementsUpdate.ultimateGearSets[index] = true;
    }
  }

  // challenges
  if (!newAchievements.challenges) newAchievements.challenges = [];
  if (!oldAchievements.challenges) oldAchievements.challenges = [];
  achievementsUpdate.challenges = newAchievements.challenges.concat(oldAchievements.challenges);

  // Quests
  if (!achievementsUpdate.quests) achievementsUpdate.quests = {};
  for (const index in oldAchievements.quests) {
    if (!achievementsUpdate.quests[index]) {
      achievementsUpdate.quests[index] = oldAchievements.quests[index];
    } else {
      achievementsUpdate.quests[index] += oldAchievements.quests[index];
    }
  }

  // Rebirth level
  if (achievementsUpdate.rebirthLevel) {
    achievementsUpdate.rebirthLevel = Math.max(achievementsUpdate.rebirthLevel, oldAchievements.rebirthLevel);
  } else if (oldAchievements.rebirthLevel) {
    achievementsUpdate.rebirthLevel = oldAchievements.rebirthLevel;
  }

  // All others
  const indexsToIgnore = ['ultimateGearSets', 'challenges', 'quests', 'rebirthLevel'];
  for (const index in oldAchievements) {
    if (indexsToIgnore.indexOf(index) !== -1) continue; // eslint-disable-line no-continue

    if (!achievementsUpdate[index]) {
      achievementsUpdate[index] = oldAchievements[index];
      continue; // eslint-disable-line no-continue
    }

    if (Number.isInteger(oldAchievements[index])) {
      achievementsUpdate[index] += oldAchievements[index];
    } else if (oldAchievements[index] === true) achievementsUpdate[index] = true;
  }

  return achievementsUpdate;
}

module.exports = async function achievementRestore () {
  const userIds = [
  ];

  /* eslint-disable no-await-in-loop */
  for (const index in userIds) {
    const userId = userIds[index];
    const oldUser = await UsersOld.findOne({ _id: userId }, 'achievements');
    const newUser = await Users.findOne({ _id: userId }, 'achievements');
    const achievementUpdate = getAchievementUpdate(newUser, oldUser);
    await Users.update(
      { _id: userId },
      {
        $set: {
          achievements: achievementUpdate,
        },
      },
    );
    console.log(`Updated ${userId}`);
    /* eslint-enable no-await-in-loop */
  }
};
