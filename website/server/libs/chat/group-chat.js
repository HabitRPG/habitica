import { chatModel as Chat } from '../../models/message';
import { MAX_CHAT_COUNT, MAX_SUBBED_GROUP_CHAT_COUNT } from '../../models/group';

// @TODO: Don't use this method when the group can be saved.
export async function getGroupChat (group) {
  const maxChatCount = group.isSubscribed() ? MAX_SUBBED_GROUP_CHAT_COUNT : MAX_CHAT_COUNT;

  const groupChat = await Chat.find({groupId: group._id})
    .limit(maxChatCount)
    .sort('-timestamp')
    .exec();

  // @TODO: Concat old chat to keep continuity of chat stored on group object
  const currentGroupChat = group.chat || [];
  const concatedGroupChat = groupChat.concat(currentGroupChat);

  group.chat = concatedGroupChat.reduce((previous, current) => {
    const foundMessage = previous.find(message => {
      return message.id === current.id;
    });
    if (!foundMessage) previous.push(current);
    return previous;
  }, []);
}
