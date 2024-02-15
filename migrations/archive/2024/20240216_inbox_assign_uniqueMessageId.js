/* eslint-disable no-console,no-await-in-loop */
import { v4 as uuid } from 'uuid';
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

  return inboxModel.updateMany({
    _id: { $in: groupedMessage.messageIds.map(m => m.id) },
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
            // group by sender uuid and the text
            _id: {
              uuid: '$uuid',
              text: '$text',
            },
            messageIds: {
              $addToSet: {
                id: '$id',
                ownerId: '$ownerId',
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
    } else {
      query.uuid = {
        $gte: groupedMessages[groupedMessages.length - 1]._id.uuid,
      };
    }

    await Promise.all(groupedMessages.map(updateInboxMessage));
  }
}
