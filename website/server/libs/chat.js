import { model as User } from '../models/user';
import { getUserInfo } from './email';

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
