/*
const migrationName = 'AchievementRestore';
const authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
const authorUuid = ''; // ... own data is done
*/

/*
 * This migraition will copy user data from prod to test
 */

import monk from 'monk'; // eslint-disable-line import/no-extraneous-dependencies

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
    Object.keys(oldAchievements.ultimateGearSets).forEach(index => {
      if (oldAchievements.ultimateGearSets[index]) {
        achievementsUpdate.ultimateGearSets[index] = true;
      }
    });
  }

  // challenges
  if (!newAchievements.challenges) newAchievements.challenges = [];
  if (!oldAchievements.challenges) oldAchievements.challenges = [];
  achievementsUpdate.challenges = newAchievements.challenges.concat(oldAchievements.challenges);

  // Quests
  if (!achievementsUpdate.quests) achievementsUpdate.quests = {};
  Object.keys(oldAchievements.quests).forEach(index => {
    if (!achievementsUpdate.quests[index]) {
      achievementsUpdate.quests[index] = oldAchievements.quests[index];
    } else {
      achievementsUpdate.quests[index] += oldAchievements.quests[index];
    }
  });

  // Rebirth level
  if (achievementsUpdate.rebirthLevel) {
    achievementsUpdate.rebirthLevel = Math.max(
      achievementsUpdate.rebirthLevel, oldAchievements.rebirthLevel,
    );
  } else if (oldAchievements.rebirthLevel) {
    achievementsUpdate.rebirthLevel = oldAchievements.rebirthLevel;
  }

  // All others
  const indexsToIgnore = ['ultimateGearSets', 'challenges', 'quests', 'rebirthLevel'];
  Object.keys(oldAchievements).forEach(index => {
    if (indexsToIgnore.indexOf(index) !== -1) return;

    if (!achievementsUpdate[index]) {
      achievementsUpdate[index] = oldAchievements[index];
      return;
    }

    if (Number.isInteger(oldAchievements[index])) {
      achievementsUpdate[index] += oldAchievements[index];
    } else if (oldAchievements[index] === true) achievementsUpdate[index] = true;
  });

  return achievementsUpdate;
}

export default async function achievementRestore () {
  const userIds = [
  ];

  await Promise.all(userIds.map(userId => (async () => {
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
  })()));
}
