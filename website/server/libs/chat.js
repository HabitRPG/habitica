import { model as User } from '../models/user';
import { getUserInfo } from './email';
import {sendNotification as sendPushNotification} from './pushNotifications';

export async function getAuthorEmailFromMessage (message) {
  let authorId = message.uuid;

  if (authorId === 'system') {
    return 'system';
  }

  let author = await User.findOne({_id: authorId}, {auth: 1}).exec();

  if (author) {
    return getUserInfo(author, ['email']).email;
  } else {
    return 'Author Account Deleted';
  }
}

export async function sendChatPushNotifications (user, group, message, translate) {
  let members = await User.find({
    'party._id': group._id,
    _id: {$ne: user._id},
  })
    .select('preferences.pushNotifications preferences.language profile.name pushDevices')
    .exec();
  members.forEach(member => {
    if (member.preferences.pushNotifications.partyActivity !== false) {
      sendPushNotification(
        member,
        {
          title: group.name,
          message: translate('partyActivityMessage', {user: message.user}, member.preferences.language),
          identifier: 'groupActivity',
          category: 'groupActivity',
          payload: {groupID: group._id, type: group.type, groupName: group.name, message: message.text, timestamp: message.timestamp, senderName: message.user},
        }
      );
    }
  });
}