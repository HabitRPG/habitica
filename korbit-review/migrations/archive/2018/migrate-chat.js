// @migrationName = 'MigrateGroupChat';
// @authorName = 'TheHollidayInn'; // in case script author needs to know when their ...
// @authorUuid = ''; // ... own data is done

/*
 * This migration moves chat off of groups and into their own model
 */

import { model as Group } from '../../website/server/models/group';
import { chatModel as Chat } from '../../website/server/models/message';

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
    acc = acc.concat(curr); // eslint-disable-line no-param-reassign
    return acc;
  }, []);

  console.log(reducedPromises);
  await Promise.all(reducedPromises);
  moveGroupChatToModel(skip + 50);
}

export default moveGroupChatToModel;
