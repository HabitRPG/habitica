import mongoose from 'mongoose';

import { wrap as wrapUser } from '../../common/script/index';
import { model as User } from '../../website/src/models/user';
import { TodoSchema } from '../../website/src/models/task';

export function generateUser (options = {}) {
  let user = new User(options).toObject();

  wrapUser(user);

  return user;
}

export function generateTodo (options = {}) {
  let Todo = mongoose.model('Todo', TodoSchema);

  return new Todo(options).toObject();
}
