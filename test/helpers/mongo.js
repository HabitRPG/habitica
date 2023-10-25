import mongoose from 'mongoose';
import { get } from 'lodash';
import { TAVERN_ID } from '../../website/server/models/group';

// Useful for checking things that have been deleted,
// but you no longer have access to,
// like private parties or users
export async function checkExistence (collectionName, id) {
  const count = await mongoose.connection.db.collection(collectionName).countDocuments({ _id: id });
  return count > 0;
}

// Obtain a property from the database. Useful if the property is private
// and thus unavailable to the client
export async function getProperty (collectionName, id, path) {
  const doc = await mongoose.connection.db.collection(collectionName)
    .find({ _id: id }, { [path]: 1 }, { limit: 1 }).next();
  return get(doc, path);
}

// Specifically helpful for the GET /groups tests,
// resets the db to an empty state and creates a tavern document
export async function resetHabiticaDB () {
  const groups = mongoose.connection.db.collection('groups');
  const users = mongoose.connection.db.collection('users');
  return mongoose.connection.dropDatabase()
    .then(() => users.countDocuments({ _id: '7bde7864-ebc5-4ee2-a4b7-1070d464cdb0' })).then(count => {
      if (count === 0) {
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
        });
      }
    }).then(() => groups.countDocuments({ _id: TAVERN_ID }))
    .then(count => {
      if (count === 0) {
        groups.insertOne({
          _id: TAVERN_ID,
          chat: [],
          leader: '7bde7864-ebc5-4ee2-a4b7-1070d464cdb0', // Siena Leslie
          name: 'HabitRPG',
          type: 'guild',
          privacy: 'public',
          memberCount: 0,
        });
      }
    });
}

export async function updateDocument (collectionName, doc, update) {
  const collection = mongoose.connection.db.collection(collectionName);
  return collection.updateOne({ _id: doc._id }, { $set: update });
}

// Unset a property in the database.
// Useful for testing.
export async function unsetDocument (collectionName, doc, update) {
  const collection = mongoose.connection.db.collection(collectionName);
  return collection.updateOne({ _id: doc._id }, { $unset: update });
}

export async function getDocument (collectionName, doc) {
  const collection = mongoose.connection.db.collection(collectionName);
  return collection.findOne({ _id: doc._id });
}

before(done => {
  mongoose.connection.on('open', err => {
    if (err) return done(err);
    return resetHabiticaDB()
      .then(() => {
        done();
      })
      .catch(error => {
        throw error;
      });
  });
});

after(() => mongoose.connection.dropDatabase());
