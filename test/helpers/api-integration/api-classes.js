/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
import moment from 'moment';
import {
  assign,
  each,
  isEmpty,
  set,
} from 'lodash';
import { requester } from './requester';
import {
  getDocument as getDocumentFromMongo,
  updateDocument as updateDocumentInMongo,
  unsetDocument as unsetDocumentInMongo,
} from '../mongo';

class ApiObject {
  constructor (options) {
    assign(this, options);
  }

  async update (options) {
    if (isEmpty(options)) {
      return null;
    }

    await updateDocumentInMongo(this._docType, this, options);

    _updateLocalParameters(this, options);

    return this;
  }

  async unset (options) {
    if (isEmpty(options)) {
      return null;
    }

    await unsetDocumentInMongo(this._docType, this, options);

    _updateLocalParameters((this, options));

    return this;
  }

  async sync () {
    const updatedDoc = await getDocumentFromMongo(this._docType, this);

    assign(this, updatedDoc);

    return this;
  }
}

export class ApiUser extends ApiObject {
  constructor (options) {
    super(options);

    this._docType = 'users';

    const _requester = requester(this);

    this.get = _requester.get;
    this.post = _requester.post;
    this.put = _requester.put;
    this.del = _requester.del;
  }
}

export class ApiGroup extends ApiObject {
  constructor (options) {
    super(options);

    this._docType = 'groups';
  }

  async addChat (chat) {
    const group = this;

    if (!chat) {
      chat = { // eslint-disable-line no-param-reassign
        id: 'Test_ID',
        text: 'Test message',
        flagCount: 0,
        timestamp: Date(),
        likes: {},
        flags: {},
        uuid: group.leader,
        contributor: {},
        backer: {},
        user: group.leader,
      };
    }

    const update = { chat };

    return this.update(update);
  }

  async createCancelledSubscription () {
    const update = {
      purchased: {
        plan: {
          customerId: 'example-customer',
          dateTerminated: moment().add(1, 'days').toDate(),
        },
      },
    };

    return this.update(update);
  }
}

export class ApiChallenge extends ApiObject {
  constructor (options) {
    super(options);

    this._docType = 'challenges';
  }
}

function _updateLocalParameters (doc, update) {
  each(update, (value, param) => {
    set(doc, param, value);
  });
}
