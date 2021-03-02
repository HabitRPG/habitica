// @migrationName = 'RewardsMigrationFlipNegativeCostsValues';
// @authorName = 'hamboomger';
// @authorUuid = '80b61b73-2278-4947-b713-a10112cfe7f5';

/*
 * For each reward with negative cost, make it positive
 * by assigning it an absolute value of itself
 */

import { Task } from '../../website/server/models/task';

async function flipNegativeCostsValues () {
  const query = {
    type: 'reward',
    value: { $lt: 0 },
  };

  const fields = {
    _id: 1,
    value: 1,
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const rewards = await Task
      .find(query)
      .limit(250)
      .sort({ _id: 1 })
      .select(fields)
      .lean()
      .exec();

    if (rewards.length === 0) {
      break;
    }

    const promises = rewards.map(reward => {
      const positiveValue = Math.abs(reward.value);
      return Task.update({ _id: reward._id }, { $set: { value: positiveValue } }).exec();
    });

    // eslint-disable-next-line no-await-in-loop
    await Promise.all(promises);

    query._id = {
      $gt: rewards[rewards.length - 1]._id,
    };
  }

  console.log('All rewards with negative values were updated, migration finished');
}

export default flipNegativeCostsValues;
