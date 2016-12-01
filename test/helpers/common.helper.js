import mongoose from 'mongoose';

import { wrap as wrapUser } from '../../website/common/script/index';
import { model as User } from '../../website/server/models/user';
import {
  DailySchema,
  HabitSchema,
  RewardSchema,
  TodoSchema,
} from '../../website/server/models/task';
export {translate} from './translate';

export function generateUser (options = {}) {
  let user = new User(options).toObject();

  wrapUser(user);

  return user;
}

export function generateDaily (options = {}) {
  let Daily = mongoose.model('Daily', DailySchema);

  return new Daily(options).toObject();
}

export function generateHabit (options = {}) {
  let Habit = mongoose.model('Habit', HabitSchema);

  return new Habit(options).toObject();
}

export function generateReward (options = {}) {
  let Reward = mongoose.model('Reward', RewardSchema);

  return new Reward(options).toObject();
}

export function generateTodo (options = {}) {
  let Todo = mongoose.model('Todo', TodoSchema);

  return new Todo(options).toObject();
}
