/* eslint-disable no-use-before-define */

import { requester } from './requester';
import {
  getDocument as getDocumentFromMongo,
  updateDocument as updateDocumentInMongo,
} from './mongo';
import {
  assign,
  each,
  isEmpty,
  set,
} from 'lodash';

class ApiObject {
  constructor (options) {
    assign(this, options);
  }

  async update (options) {
    if (isEmpty(options)) {
      return;
    }

    await updateDocumentInMongo(this._docType, this, options);

    _updateLocalParameters(this, options);

    return this;
  }

  async sync () {
    let updatedDoc = await getDocumentFromMongo(this._docType, this);

    assign(this, updatedDoc);

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
