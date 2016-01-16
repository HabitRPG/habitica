/* eslint-disable no-use-before-define */

import { requester } from './requester';
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

  update (options) {
    return new Promise((resolve) => {
      _updateDocument(this._docType, this, options, resolve);
    });
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

function _updateDocument (collectionName, doc, update, cb) {
  if (isEmpty(update)) {
    return cb();
  }

  mongo.connect('mongodb://localhost/habitrpg_test', (connectErr, db) => {
    if (connectErr) throw new Error(`Error connecting to database when updating ${collectionName} collection: ${connectErr}`);

    let collection = db.collection(collectionName);

    collection.updateOne({ _id: doc._id }, { $set: update }, (updateErr) => {
      if (updateErr) throw new Error(`Error updating ${collectionName}: ${updateErr}`);
      _updateLocalDocument(doc, update);
      db.close();
      cb();
    });
  });
}

function _updateLocalDocument (doc, update) {
  each(update, (value, param) => {
    set(doc, param, value);
  });
}
