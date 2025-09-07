// Migration to add startDate to buffs
/*
This migration adds the startDate field to all buffs to support the new 24h duration feature
*/

import { model as User } from '../website/server/models/user';

const progressCount = 1000;
let count = 0;

async function updateUser (user) {
  count++;

  // Only update if user has active buffs
  const hasActiveBuffs = user.stats.buffs && (
    user.stats.buffs.str > 0 ||
    user.stats.buffs.int > 0 || 
    user.stats.buffs.per > 0 ||
    user.stats.buffs.con > 0 ||
    user.stats.buffs.stealth > 0 ||
    user.stats.buffs.streaks === true ||
    user.stats.buffs.snowball === true ||
    user.stats.buffs.spookySparkles === true ||
    user.stats.buffs.shinySeed === true ||
    user.stats.buffs.seafoam === true
  );

  if (hasActiveBuffs) {
    const now = new Date();

    // Add startDate to all active buffs
    if (user.stats.buffs.str > 0) user.stats.buffs.strStartDate = now;
    if (user.stats.buffs.int > 0) user.stats.buffs.intStartDate = now; 
    if (user.stats.buffs.per > 0) user.stats.buffs.perStartDate = now;
    if (user.stats.buffs.con > 0) user.stats.buffs.conStartDate = now;
    if (user.stats.buffs.stealth > 0) user.stats.buffs.stealthStartDate = now;
    if (user.stats.buffs.streaks) user.stats.buffs.streaksStartDate = now;
    if (user.stats.buffs.snowball) user.stats.buffs.snowballStartDate = now;
    if (user.stats.buffs.spookySparkles) user.stats.buffs.spookySparklesStartDate = now;
    if (user.stats.buffs.shinySeed) user.stats.buffs.shinySeedStartDate = now;
    if (user.stats.buffs.seafoam) user.stats.buffs.seafoamStartDate = now;

    await user.save();
  }

  if (count % progressCount === 0) console.warn(`${count} users processed`);
}

module.exports = async function processUsers () {
  let query = {
    'stats.buffs': { $exists: true }
  };

  const fields = {
    'stats.buffs': 1
  };

  while (true) { // eslint-disable-line no-constant-condition
    const users = await User
      .find(query)
      .limit(250)
      .sort({_id: 1})
      .select(fields)
      .exec();

    if (users.length === 0) {
      console.warn('Done!');
      return;
    }

    query._id = {
      $gt: users[users.length - 1]._id
    };

    await Promise.all(users.map(updateUser));
  }
};
