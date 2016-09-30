import '../../website/server/libs/i18n';
import mongoose from 'mongoose';
import { defaultsDeep as defaults } from 'lodash';
import { model as User } from '../../website/server/models/user';
import { model as Group } from '../../website/server/models/group';
import { model as Challenge } from '../../website/server/models/challenge';
import mongo from './mongo'; // eslint-disable-line
import moment from 'moment';
import i18n from '../../website/common/script/i18n';
import * as Tasks from '../../website/server/models/task';

afterEach((done) => {
  sandbox.restore();
  mongoose.connection.db.dropDatabase(done);
});

export { sleep } from './sleep';

export function generateUser (options = {}) {
  return new User(options);
}

export function generateGroup (options = {}) {
  return new Group(options);
}

export function generateChallenge (options = {}) {
  return new Challenge(options);
}

export function generateRes (options = {}) {
  let defaultRes = {
    render: sandbox.stub(),
    send: sandbox.stub(),
    status: sandbox.stub().returnsThis(),
    sendStatus: sandbox.stub().returnsThis(),
    json: sandbox.stub(),
    locals: {
      user: generateUser(options.localsUser),
      group: generateGroup(options.localsGroup),
    },
    set: sandbox.stub(),
    t (string) {
      return i18n.t(string);
    },
  };

  return defaults(options, defaultRes);
}

export function generateReq (options = {}) {
  let defaultReq = {
    body: {},
    query: {},
    headers: {},
    header: sandbox.stub().returns(null),
  };

  return defaults(options, defaultReq);
}

export function generateNext (func) {
  return func || sandbox.stub();
}

export function generateHistory (days) {
  let history = [];
  let now = Number(moment().toDate());

  while (days > 0) {
    history.push({
      value: days,
      date: Number(moment(now).subtract(days, 'days').toDate()),
    });
    days--;
  }

  return history;
}

export function generateTodo (user) {
  let todo = {
    text: 'test todo',
    type: 'todo',
    value: 0,
    completed: false,
  };

  let task = new Tasks.todo(Tasks.Task.sanitize(todo)); // eslint-disable-line babel/new-cap
  task.userId = user._id;
  task.save();

  return task;
}

export function generateDaily (user) {
  let daily = {
    text: 'test daily',
    type: 'daily',
    value: 0,
    completed: false,
  };

  let task = new Tasks.daily(Tasks.Task.sanitize(daily)); // eslint-disable-line babel/new-cap
  task.userId = user._id;
  task.save();

  return task;
}
