// @TODO: remove when lodash can be upgraded
import defaults from 'lodash.defaultsdeep';
import { model as User } from '../../website/src/models/user'
import { model as Group } from '../../website/src/models/group'
import i18n from '../../common/script/src/i18n';
require('coffee-script');
i18n.translations = require('../../website/src/libs/i18n.js').translations;

afterEach(() => {
  sandbox.restore();
});

export function generateUser(options={}) {
  return new User(options)._doc;
}

export function generateGroup(options={}) {
  return new Group(options)._doc;
}

export function generateRes(options={}) {
  let defaultRes = {
    send: sandbox.stub(),
    json: sandbox.stub(),
    locals: {
      user: generateUser(options.localsUser),
      group: generateGroup(options.localsGroup),
    },
  };

  return defaults(options, defaultRes);
}

export function generateReq(options={}) {
  let defaultReq = {
    body: {},
    query: {},
  };

  return defaults(options, defaultReq);
}

export function generateNext(func) {
  return func || sandbox.stub();
}
