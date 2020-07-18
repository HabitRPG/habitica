import mongoose from 'mongoose';

import { model as User } from '../../website/server/models/user';
import {
  DailySchema,
  HabitSchema,
  RewardSchema,
  TodoSchema,
} from '../../website/server/models/task';

export { translate } from './translate';

export function generateUser (options = {}) {
  const user = new User(options).toObject();

  return user;
}

export function generateDaily (options = {}) {
  const Daily = mongoose.model('Daily', DailySchema);

  return new Daily(options).toObject();
}

export function generateHabit (options = {}) {
  const Habit = mongoose.model('Habit', HabitSchema);

  return new Habit(options).toObject();
}

export function generateReward (options = {}) {
  const Reward = mongoose.model('Reward', RewardSchema);

  return new Reward(options).toObject();
}

export function generateTodo (options = {}) {
  const Todo = mongoose.model('Todo', TodoSchema);

  return new Todo(options).toObject();
}
