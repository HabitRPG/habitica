import { model as User } from '../models/user';

const mentionRegex = new RegExp('\\B@[-\\w]+', 'g');

export async function highlightMentions (text) { // eslint-disable-line import/prefer-default-export
  const mentions = text.match(mentionRegex);
  let members = [];

  if (mentions !== null && mentions.length <= 5) {
    const usernames = mentions.map(mention => mention.substr(1));
    members = await User
      .find({ 'auth.local.username': { $in: usernames }, 'flags.verifiedUsername': true })
      .select(['auth.local.username', '_id', 'preferences.pushNotifications', 'pushDevices', 'party', 'guilds'])
      .lean()
      .exec();
    members.forEach(member => {
      const { username } = member.auth.local;
      // eslint-disable-next-line no-param-reassign
      text = text.replace(new RegExp(`@${username}(?![\\-\\w])`, 'g'), `[@${username}](/profile/${member._id})`);
    });
  }
  return [text, mentions, members];
}
