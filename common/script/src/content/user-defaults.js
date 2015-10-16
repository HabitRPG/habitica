import {translator as t} from './helpers';

let habits = [
  {
    type: 'habit',
    text: t('defaultHabit1Text'),
    value: 0,
    up: true,
    down: false,
    attribute: 'per',
  }, {
    type: 'habit',
    text: t('defaultHabit2Text'),
    value: 0,
    up: false,
    down: true,
    attribute: 'str',
  }, {
    type: 'habit',
    text: t('defaultHabit3Text'),
    value: 0,
    up: true,
    down: true,
    attribute: 'str',
  }
];

let dailys = [];

let todos = [
  {
    type: 'todo',
    text: t('defaultTodo1Text'),
    notes: t('defaultTodoNotes'),
    completed: false,
    attribute: 'int',
  }
];

let rewards = [
  {
    type: 'reward',
    text: t('defaultReward1Text'),
    value: 10,
  }
];

let tags = [
  { name: t('defaultTag1') },
  { name: t('defaultTag2') },
  { name: t('defaultTag3') },
]

let userDefaults = {
  habits: habits,
  dailys: dailys,
  todos: todos,
  rewards: rewards,
  tags: tags
};

export default userDefaults;
