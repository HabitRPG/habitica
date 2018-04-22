// @migrationName = 'MigrateGroupChat';
// @authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
// @authorUuid = ''; // ... own data is done


/*
 * This migrations will iterate through all groups with a group plan a subscription and resync the free
 * subscription to all members
 */

import { model as Group } from '../../website/server/models/group';
import { model as Chat } from '../../website/server/models/chat';

async function moveGroupChatToModel (skip = 0) {
  const groups = await Group.find({})
    .limit(50)
    .skip(skip)
    .sort({ _id: -1 })
    .exec();

  if (groups.length === 0) {
    console.log('End of groups');
    process.exit();
  }

  const promises = groups.map(group => {
    const chatpromises = group.chat.map(message => {
      const newChat = new Chat();
      Object.assign(newChat, message);
      newChat._id = message.id;
      newChat.groupId = group._id;

      return newChat.save();
    });

    group.chat = [];
    chatpromises.push(group.save());

    return chatpromises;
  });


  const reducedPromises = promises.reduce((acc, curr) => {
    acc = acc.concat(curr);
    return acc;
  }, []);

  console.log(reducedPromises);
  await Promise.all(reducedPromises);
  moveGroupChatToModel(skip + 50);
}

module.exports = moveGroupChatToModel;
