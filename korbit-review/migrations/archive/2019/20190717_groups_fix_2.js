/* eslint-disable no-console */
const MIGRATION_NAME = '20190717_groups_fix_2';

import monk from 'monk';
import nconf from 'nconf';
const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');

import { model as User } from '../../../website/server/models/user';
import { sendTxn as sendTxnEmail } from '../../../website/server/libs/email';
import shared from '../../../website/common';

const questScrolls = shared.content.quests;

const progressCount = 1000;
let count = 0;

async function updateGroup (group) {
  count++;

  if (group && group.quest && group.quest.key && group.quest.leader) {
    const quest = questScrolls[group.quest.key];
    const leader = await User.findOne({_id: group.quest.leader}).exec();

    if (leader && quest) {
      await User.update({ 
        _id: leader._id,
        migration: {$ne: MIGRATION_NAME},
      }, {
        $set: {migration: MIGRATION_NAME},
        $inc: { 
          balance: 1,
          [`items.quests.${group.quest.key}`]: 1,
        },
      }).exec();

      // unsubscribe from all is already checked by sendTxnEmail
      if (leader.preferences && leader.preferences.emailNotifications && leader.preferences.emailNotifications.majorUpdates !== false) {
        sendTxnEmail(leader, 'groups-outage');
      }
    }
  }

  if (count % progressCount === 0) console.warn(`${count} ${group._id}`);
}

module.exports = async function processUsers () {
  const query = {
    type: 'party'
  };

  let backupDb = monk(CONNECTION_STRING);
  const backupDbPromise = new Promise((resolve, reject) => {
    backupDb.then(() => resolve()).catch((e) => reject(e));
  });

  await backupDbPromise;
  console.log('Connected to backup db');
  const backupGroups = backupDb.get('groups', { castIds: false });

  while (true) { // eslint-disable-line no-constant-condition
    const groupsPromise = new Promise((resolve, reject) => {
      backupGroups
      .find(query, {
        limit: 250, 
        sort: {_id: 1}
      })
      .then(foundGroupInBackup => {
        resolve(foundGroupInBackup);
      }).catch(e => {
        reject(e);
      });
    });

    const groups = await groupsPromise;

    if (groups.length === 0) {
      console.warn('All appropriate groups found and modified.');
      console.warn(`\n${count} groups processed\n`);
      break;
    } else {
      query._id = {
        $gt: groups[groups.length - 1]._id,
      };
    }

    await Promise.all(groups.map(updateGroup)); // eslint-disable-line no-await-in-loop
  }
};
