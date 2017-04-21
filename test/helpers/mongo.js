import mongoose from 'mongoose';
import { TAVERN_ID } from '../../website/server/models/group';
import { get } from 'lodash';

// Useful for checking things that have been deleted,
// but you no longer have access to,
// like private parties or users
export async function checkExistence (collectionName, id) {
  return new Promise((resolve, reject) => {
    let collection = mongoose.connection.db.collection(collectionName);

    collection.find({_id: id}, {_id: 1}).limit(1).toArray((findError, docs) => {
      if (findError) return reject(findError);

      let exists = docs.length > 0;

      resolve(exists);
    });
  });
}

// Obtain a property from the database. Useful if the property is private
// and thus unavailable to the client
export async function getProperty (collectionName, id, path) {
  return new Promise((resolve, reject) => {
    let collection = mongoose.connection.db.collection(collectionName);

    collection.find({_id: id}, {[path]: 1}).limit(1).toArray((findError, docs) => {
      if (findError) return reject(findError);

      resolve(get(docs[0], path));
    });
  });
}

// Specifically helpful for the GET /groups tests,
// resets the db to an empty state and creates a tavern document
export async function resetHabiticaDB () {
  return new Promise((resolve, reject) => {
    mongoose.connection.db.dropDatabase((dbErr) => {
      if (dbErr) return reject(dbErr);
      let groups = mongoose.connection.db.collection('groups');
      let users = mongoose.connection.db.collection('users');

      users.count({_id: '7bde7864-ebc5-4ee2-a4b7-1070d464cdb0'}, (err, count) => {
        if (err) return reject(err);
        if (count > 0) return resolve();

        // create the leader for the tavern
        users.insertOne({
          _id: '7bde7864-ebc5-4ee2-a4b7-1070d464cdb0',
          apiToken: TAVERN_ID,
          auth: {
            local: {
              username: 'username',
              lowerCaseUsername: 'username',
              email: 'username@email.com',
              hashed_password: 'hashed_password', // eslint-disable-line camelcase
              passwordHashMethod: 'bcrypt',
            },
          },
        }, (insertErr) => {
          if (insertErr) return reject(insertErr);

          // For some mysterious reason after a dropDatabase there can still be a group...
          groups.count({_id: TAVERN_ID}, (err2, count2) => {
            if (err2) return reject(err2);
            if (count2 > 0) return resolve();

            groups.insertOne({
              _id: TAVERN_ID,
              chat: [],
              leader: '7bde7864-ebc5-4ee2-a4b7-1070d464cdb0', // Siena Leslie
              name: 'HabitRPG',
              type: 'guild',
              privacy: 'public',
              memberCount: 0,
            }, (insertErr2) => {
              if (insertErr2) return reject(insertErr2);

              resolve();
            });
          });
        });
      });
    });
  });
}

export async function updateDocument (collectionName, doc, update) {
  let collection = mongoose.connection.db.collection(collectionName);

  return new Promise((resolve) => {
    collection.updateOne({ _id: doc._id }, { $set: update }, (updateErr) => {
      if (updateErr) throw new Error(`Error updating ${collectionName}: ${updateErr}`);
      resolve();
    });
  });
}

export async function getDocument (collectionName, doc) {
  let collection = mongoose.connection.db.collection(collectionName);

  return new Promise((resolve) => {
    collection.findOne({ _id: doc._id }, (lookupErr, found) => {
      if (lookupErr) throw new Error(`Error looking up ${collectionName}: ${lookupErr}`);
      resolve(found);
    });
  });
}

before((done) => {
  mongoose.connection.on('open', (err) => {
    if (err) return done(err);
    resetHabiticaDB()
      .then(() => done())
      .catch(done);
  });
});

after((done) => {
  mongoose.connection.db.dropDatabase((err) => {
    if (err) return done(err);
    mongoose.connection.close(done);
  });
});
