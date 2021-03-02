import { model as User } from '../models/user'; // eslint-disable-line import/no-cycle
import { getUserInfo } from './email'; // eslint-disable-line import/no-cycle
import { sendNotification as sendPushNotification } from './pushNotifications'; // eslint-disable-line import/no-cycle

export async function getAuthorEmailFromMessage (message) {
  const authorId = message.uuid;

  if (authorId === 'system') {
    return 'system';
  }

  const author = await User.findOne({ _id: authorId }, { auth: 1 }).exec();

  if (author) {
    return getUserInfo(author, ['email']).email;
  }
  return 'Author Account Deleted';
}

export async function sendChatPushNotifications (user, group, message, mentions, translate) {
  const members = await User.find({
    'party._id': group._id,
    _id: { $ne: user._id },
  })
    .select('preferences.pushNotifications preferences.language profile.name pushDevices auth.local.username')
    .exec();

  members.forEach(member => {
    if (member.preferences.pushNotifications.partyActivity !== false) {
      if (mentions && mentions.includes(`@${member.auth.local.username}`) && member.preferences.pushNotifications.mentionParty !== false) {
        return;
      }

      if (!message.unformattedText) return;

      sendPushNotification(
        member,
        {
          title: translate('groupActivityNotificationTitle', { user: message.user, group: group.name }, member.preferences.language),
          message: message.unformattedText,
          identifier: 'groupActivity',
          category: 'groupActivity',
          payload: {
            groupID: group._id,
            type: group.type,
            groupName: group.name,
            message: message.unformattedText,
            timestamp: message.timestamp,
            senderName: message.user,
          },
        },
      );
    }
  });
}
