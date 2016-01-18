/* eslint-disable no-use-before-define */

import { MongoClient as mongo } from 'mongodb';

const DB_URI = 'mongodb://localhost/habitrpg_test';

// Useful for checking things that have been deleted,
// but you no longer have access to,
// like private parties or users
export async function checkExistence (collectionName, id) {
  let db = await connectToMongo();

  return new Promise((resolve, reject) => {
    let collection = db.collection(collectionName);

    collection.find({_id: id}, {_id: 1}).limit(1).toArray((findError, docs) => {
      if (findError) return reject(findError);

      let exists = docs.length > 0;

      db.close();
      resolve(exists);
    });
  });
}

// Specifically helpful for the GET /groups tests,
// resets the db to an empty state and creates a tavern document
export async function resetHabiticaDB () {
  let db = await connectToMongo();

  return new Promise((resolve, reject) => {
    db.dropDatabase((dbErr) => {
      if (dbErr) return reject(dbErr);
      let groups = db.collection('groups');

      groups.insertOne({
        _id: 'habitrpg',
        chat: [],
        leader: '9',
        name: 'HabitRPG',
        type: 'guild',
        privacy: 'public',
        members: [],
      }, (insertErr) => {
        if (insertErr) return reject(insertErr);

        db.close();
        resolve();
      });
    });
  });
}

export async function updateDocument (collectionName, doc, update) {
  let db = await connectToMongo();

  let collection = db.collection(collectionName);

  return new Promise((resolve) => {
    collection.updateOne({ _id: doc._id }, { $set: update }, (updateErr) => {
      if (updateErr) throw new Error(`Error updating ${collectionName}: ${updateErr}`);
      db.close();
      resolve();
    });
  });
}

export async function getDocument (collectionName, doc) {
  let db = await connectToMongo();

  let collection = db.collection(collectionName);

  return new Promise((resolve) => {
    collection.findOne({ _id: doc._id }, (lookupErr, found) => {
      if (lookupErr) throw new Error(`Error looking up ${collectionName}: ${lookupErr}`);
      db.close();
      resolve(found);
    });
  });
}

export function connectToMongo () {
  return new Promise((resolve, reject) => {
    mongo.connect(DB_URI, (err, db) => {
      if (err) return reject(err);

      resolve(db);
    });
  });
}

