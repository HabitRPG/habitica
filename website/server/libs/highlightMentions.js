import {model as User} from '../models/user';

const mentionRegex = new RegExp('\\B@[-\\w]+', 'g');

export async function highlightMentions (text) {
  const mentions = text.match(mentionRegex);
  if (mentions !== null && mentions.length <= 5) {
    const usernames = mentions.map((mention) => {
      return mention.substr(1);
    });
    let members = await User
      .find({'auth.local.username': {$in: usernames}, 'flags.verifiedUsername': true})
      .select(['auth.local.username', '_id'])
      .lean()
      .exec();
    members.forEach((member) => {
      const username = member.auth.local.username;
      text = text.replace(new RegExp(`@${username}(?![\\-\\w])`, 'g'), `[@${username}](/profile/${member._id})`);
    });
  }
  return [text, mentions];
}
