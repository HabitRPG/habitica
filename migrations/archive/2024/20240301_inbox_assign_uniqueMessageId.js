/* eslint-disable no-console,no-constant-condition,no-await-in-loop */
import { v4 as uuid } from 'uuid';
import groupBy from 'lodash/groupBy';
import { model as User } from '../../../website/server/models/user';
import { inboxModel } from '../../../website/server/models/message';

// processUsers -> updateUser -> updateInboxMessage

const MIGRATION_NAME = '20240301_inbox_assign_uniqueMessageId';
const progressCount = 1000;
let countUsers = 0;
let countTotalMessages = 0;

/**
 * @type {{[userId: string]: number}}
 */
const messagCountByUser = {};

function updateInboxMessage (userId, groupedMessage) {
  messagCountByUser[userId] += 1;
  countTotalMessages += 1;

  const bulkWriteOperations = [];

  const set = {};
  set.uniqueMessageId = uuid();

  if (countTotalMessages % progressCount === 0) {
    console.warn(`Total Messages Processed: ${countTotalMessages} - Total Users: ${countUsers}`);
  }

  const messagesToSetTheUniqueId = [];
  const duplicatedMessagesToDelete = [];

  const messageIdEntriesLength = groupedMessage.messageIdEntries.length;

  if (messageIdEntriesLength === 1) {
    // one of the participants deleted the message, continue to add a unique ID to this
    messagesToSetTheUniqueId.push(groupedMessage.messageIdEntries[0]);
  } else if (messageIdEntriesLength === 2) {
    // check for a valid uuid/ownerId pair
    const [firstEntry, secondEntry] = groupedMessage.messageIdEntries;

    if (firstEntry.uuid === secondEntry.uuid
      && firstEntry.ownerId === secondEntry.ownerId) {
      // same owner/uuid probably sent a message twice and one participant deleted both clones
      duplicatedMessagesToDelete.push(secondEntry);
      messagesToSetTheUniqueId.push(firstEntry);
    } else if (firstEntry.uuid === secondEntry.ownerId
      && secondEntry.uuid === firstEntry.ownerId) {
      // valid found pair both get the unique message id, nothing to delete
      messagesToSetTheUniqueId.push(...groupedMessage.messageIdEntries);
    } else {
      console.warn(`\n\nWARNING: This shouldnt have happened - User: ${userId} Message IDs: ${groupedMessage.messageIdEntries.map(e => e.id).join(', ')})\n\n`);
    }
  } else {
    // either sent a message twice or really different ownerId
    // more than 2 messages found more things to compare

    const messagesByOwnerUUIDPair = groupBy(groupedMessage.messageIdEntries, e => `${e.ownerId}_${e.uuid}`);

    const pairs = Object.keys(messagesByOwnerUUIDPair);

    if (pairs.length > 2) {
      console.info(`Current User: ${userId} - More than 2 pairs`,
        messagesByOwnerUUIDPair);

      // find actual ownerId/uuid pair
      let foundAPair = false;

      for (const [leftEntryKey, leftEntryMessages] of Object.entries(messagesByOwnerUUIDPair)) {
        if (foundAPair) {
          break;
        }

        const [firstLeftMessage, ...restLeftMessages] = leftEntryMessages;
        for (const [rightEntryKey, rightEntryMessages] of Object.entries(messagesByOwnerUUIDPair)) {
          if (leftEntryKey === rightEntryKey) {
            // skip its own
            // eslint-disable-next-line no-continue
            continue;
          }

          const [firstRightMessage, restRightMessages] = rightEntryMessages;

          if (firstLeftMessage.uuid === firstRightMessage.ownerId
            && firstLeftMessage.ownerId === firstRightMessage.uuid) {
            foundAPair = true;

            messagesToSetTheUniqueId.push(firstLeftMessage);
            messagesToSetTheUniqueId.push(firstRightMessage);

            duplicatedMessagesToDelete.push(...restLeftMessages);
            if (restRightMessages) {
              duplicatedMessagesToDelete.push(...restRightMessages);
            }

            delete messagesByOwnerUUIDPair[leftEntryKey];
            delete messagesByOwnerUUIDPair[rightEntryKey];
          } else {
            break;
          }
        }
      }

      if (Object.keys(messagesByOwnerUUIDPair).length !== 0) {
        // here are now the rest of the unpaired messages
        // for example if you close a group, this sents the same message to members at the same time

        // eslint-disable-next-line no-unused-vars
        for (const [_entryKey, rightEntryMessages] of Object.entries(messagesByOwnerUUIDPair)) {
          const [firstMessage, restMessages] = rightEntryMessages;

          messagesToSetTheUniqueId.push(firstMessage);

          if (restMessages) {
            duplicatedMessagesToDelete.push(...restMessages);
          }
        }
      }

      // ignore the rest to be found in the next iteration
    } else {
      // take the first message of each to set the unique id the other ones are deleted as duplicate

      for (const messages of Object.values(messagesByOwnerUUIDPair)) {
        const [firstMessageEntry, ...rest] = messages;

        messagesToSetTheUniqueId.push(firstMessageEntry);
        duplicatedMessagesToDelete.push(...rest);
      }
    }
  }

  if (duplicatedMessagesToDelete.length !== 0) {
    for (const duplicatedMessagesToDeleteElement of duplicatedMessagesToDelete) {
      console.error('Deleting Message', {
        id: duplicatedMessagesToDeleteElement.id,
        timestamp: duplicatedMessagesToDeleteElement.timestamp,
      });
    }

    bulkWriteOperations.push(
      {
        deleteMany: {
          filter: {
            _id: { $in: duplicatedMessagesToDelete.map(m => m.id) },
          },
        },
      },
    );
  }

  bulkWriteOperations.push({
    updateMany: {
      filter: {
        _id: { $in: messagesToSetTheUniqueId.map(m => m.id) },
      },
      // If you were using the MongoDB driver directly, you'd need to do
      // `update: { $set: { title: ... } }` but mongoose adds $set for
      // you.
      update: set,
    },
  });

  return bulkWriteOperations;
}

async function updateUser (user) {
  countUsers += 1;

  const userId = user._id;

  messagCountByUser[userId] = 0;

  const set = {};

  set.migration = MIGRATION_NAME;

  const query = {
    $or: [
      {
        uuid: userId,
      },
      {
        ownerId: userId,
      },
    ],
  };

  const groupedMessages = await inboxModel
    .aggregate([
      { // only list messages that does not have a uniqueMessageId yet
        $match: query,
      },
      {
        $group: {
          // group by sender date incl. the seconds and the text
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d-%H-%M-%S', date: '$timestamp' } },
            text: '$text',
          },
          messageIdEntries: {
            $addToSet: {
              id: '$id',
              ownerId: '$ownerId',
              uuid: '$uuid',
              timestamp: '$timestamp',
            },
          },
        },
      },
    ])
    .exec();

  const bulkWriteOperations = groupedMessages.flatMap(g => updateInboxMessage(userId, g));

  if (bulkWriteOperations.length) {
    // console.warn(`All appropriate messages of User: ${userId} found and modified. - ${bulkWriteOperations.length}`);
    // console.warn(`${messagCountByUser[userId]} messages processed - Operation Count: ${bulkWriteOperations.length} \n`);
  }

  await inboxModel.bulkWrite(bulkWriteOperations);

  // console.info(`Setting User ${userId} - `, set);

  return User.updateOne({ _id: user._id }, { $set: set }).exec();
}

export default async function processUsers () {
  const started = Date.now();

  const query = {
    migration: { $ne: MIGRATION_NAME },
  };

  const fields = {
    _id: 1,
  };

  while (true) {
    const users = await User
      .find(query)
      .sort({ _id: 1 })
      .limit(250)
      .select(fields)
      .lean()
      .exec();

    if (users.length === 0) {
      console.warn('All appropriate users found and modified.');
      console.warn(`\n${countUsers} users processed\n`);
      break;
    } else {
      query._id = {
        $gt: users[users.length - 1]._id,
      };
    }

    await Promise.all(users.map(updateUser));

    const minutesTaken = (Date.now() - started) / 1000 / 60;

    console.info(`\n\nTime Spent: ${minutesTaken} Minutes - User Count: ${countUsers} - Message Count: ${countTotalMessages} - Last User: ${query._id.$gt}\n\n`);

    // just to see how things look in the first run
    // break;
  }
}
