import '../../website/src/libs/api-v3/i18n';
import mongoose from 'mongoose';
import { defaultsDeep as defaults } from 'lodash';
import { model as User } from '../../website/src/models/user';
import { model as Group } from '../../website/src/models/group';

mongoose.Promise = require('q').Promise;

mongoose.connect('mongodb://localhost/habitica-unit-tests');
let connection = mongoose.connection;

before((done) => {
  connection.on('open', () => {
    connection.db.dropDatabase(done);
  });
});

after((done) => {
  connection.close(done);
});

afterEach((done) => {
  sandbox.restore();
  connection.db.dropDatabase(done);
});

export function generateUser (options = {}) {
  return new User(options).toObject();
}

export function generateGroup (options = {}) {
  return new Group(options).toObject();
}

export function generateRes (options = {}) {
  let defaultRes = {
    send: sandbox.stub(),
    status: sandbox.stub().returnsThis(),
    sendStatus: sandbox.stub().returnsThis(),
    json: sandbox.stub(),
    locals: {
      user: generateUser(options.localsUser),
      group: generateGroup(options.localsGroup),
    },
  };

  return defaults(options, defaultRes);
}

export function generateReq (options = {}) {
  let defaultReq = {
    body: {},
    query: {},
    headers: {},
  };

  return defaults(options, defaultReq);
}

export function generateNext (func) {
  return func || sandbox.stub();
}
