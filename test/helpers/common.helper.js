import { model as User } from '../../website/server/models/user';
import {
  daily as Daily,
  habit as Habit,
  reward as Reward,
  todo as Todo,
} from '../../website/server/models/task';

export { translate } from './translate';

export function generateUser (options = {}) {
  const user = new User(options).toObject();

  return user;
}

export function generateDaily (options = {}) {
  return new Daily(options).toObject();
}

export function generateHabit (options = {}) {
  return new Habit(options).toObject();
}

export function generateReward (options = {}) {
  return new Reward(options).toObject();
}

export function generateTodo (options = {}) {
  return new Todo(options).toObject();
}
