import { model as Chat } from '../../models/chat';

// @TODO: Don't use this method when the group can be saved.
export async function getGroupChat (group) {
  const groupChat = await Chat.find({groupId: group._id}).limit(200).sort('-timestamp').exec();

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
