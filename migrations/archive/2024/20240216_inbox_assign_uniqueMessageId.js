/* eslint-disable no-console,no-await-in-loop */
import { v4 as uuid } from 'uuid';
import groupBy from 'lodash/groupBy';
import { inboxModel } from '../../../website/server/models/message';

const progressCount = 1000;
let count = 0;

async function updateInboxMessage (groupedMessage) {
  count += 1;

  const set = {};

  set.uniqueMessageId = uuid();

  if (count % progressCount === 0) {
    console.warn(`${count} ${groupedMessage._id.uuid}`);
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
      // TODO -- what do you think both unique?!
    }
  } else {
    // either sent a message twice or really different ownerId
    // more than 2 messages found more things to compare

    const messagesByOwnerUUIDPair = groupBy(groupedMessage.messageIdEntries, e => `${e.ownerId}_${e.uuid}`);

    const pairs = Object.keys(messagesByOwnerUUIDPair);

    if (pairs.length > 2) {
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
            duplicatedMessagesToDelete.push(...restRightMessages);
          } else {
            break;
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

    await inboxModel.deleteMany({
      _id: { $in: duplicatedMessagesToDelete.map(m => m.id) },
    }).exec();
  }

  return inboxModel.updateMany({
    _id: { $in: messagesToSetTheUniqueId.map(m => m.id) },
  }, {
    $set: set,
  }).exec();
}

export default async function processUsers () {
  const query = {
    uniqueMessageId: { $exists: false },
  };

  while (true) { // eslint-disable-line no-constant-condition
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
        {
          $limit: 250,
        },
      ])
      .exec();

    if (groupedMessages.length === 0) {
      console.warn('All appropriate messages found and modified.');
      console.warn(`\n${count} messages processed\n`);
      break;
    }

    await Promise.all(groupedMessages.map(updateInboxMessage));
  }
}
