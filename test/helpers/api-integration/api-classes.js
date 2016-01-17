/* eslint-disable no-use-before-define */

import { requester } from './requester';
import { updateDocument as updateDocumentInMongo } from './mongo';
import {
  assign,
  each,
  isEmpty,
  set,
} from 'lodash';
import { MongoClient as mongo } from 'mongodb';

class ApiObject {
  constructor (options) {
    assign(this, options);
  }

  async update (options) {
    if (isEmpty(options)) {
      return;
    }

    await updateDocumentInMongo(this._docType, this, options);

    _updateLocalParameters (this, options);

    return this;
  }
}

export class ApiUser extends ApiObject {
  constructor (options) {
    super(options);

    this._docType = 'users';

    let _requester = requester(this);

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
}

function _updateLocalParameters (doc, update) {
  each(update, (value, param) => {
    set(doc, param, value);
  });
}
