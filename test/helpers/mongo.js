import mongoose from 'mongoose';

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

// Specifically helpful for the GET /groups tests,
// resets the db to an empty state and creates a tavern document
export async function resetHabiticaDB () {
  return new Promise((resolve, reject) => {
    mongoose.connection.db.dropDatabase((dbErr) => {
      if (dbErr) return reject(dbErr);
      let groups = mongoose.connection.db.collection('groups');

      // For some mysterious reason after a dropDatabase there can still be a group...
      groups.count({_id: 'habitrpg'}, (err, count) => {
        if (err) return reject(err);
        if (count > 0) return resolve();

        groups.insertOne({
          _id: 'habitrpg',
          chat: [],
          leader: '9',
          name: 'HabitRPG',
          type: 'guild',
          privacy: 'public',
        }, (insertErr) => {
          if (insertErr) return reject(insertErr);

          resolve();
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
