import mongoose from 'mongoose';

import { model as User } from '../../website/server/models/user';
import {
  daily,
  habit,
  reward,
  todo,
} from '../../website/server/models/task';

export { translate } from './translate';

export function generateUser (options = {}) {
  const user = new User(options).toObject();

  return user;
}

export function generateDaily (options = {}) {
  return new daily(options).toObject();
}

export function generateHabit (options = {}) {
  return new habit(options).toObject();
}

export function generateReward (options = {}) {
  return new reward(options).toObject();
}

export function generateTodo (options = {}) {
  return new todo(options).toObject();
}
