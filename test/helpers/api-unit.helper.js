import '../../website/src/libs/api-v3/i18n';
import { defaultsDeep as defaults } from 'lodash';
import { model as User } from '../../website/src/models/user';
import { model as Group } from '../../website/src/models/group';

afterEach(() => {
  sandbox.restore();
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
