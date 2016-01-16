import { MongoClient as mongo } from 'mongodb';

// Useful for checking things that have been deleted,
// but you no longer have access to,
// like private parties or users
export function checkExistence (collectionName, id) {
  return new Promise((resolve, reject) => {
    mongo.connect('mongodb://localhost/habitrpg_test', (connectionError, db) => {
      if (connectionError) return reject(connectionError);
      let collection = db.collection(collectionName);

      collection.find({_id: id}, {_id: 1}).limit(1).toArray((findError, docs) => {
        if (findError) return reject(findError);

        let exists = docs.length > 0;

        db.close();
        resolve(exists);
      });
    });
  });
}

// Specifically helpful for the GET /groups tests,
// resets the db to an empty state and creates a tavern document
export function resetHabiticaDB () {
  return new Promise((resolve, reject) => {
    mongo.connect('mongodb://localhost/habitrpg_test', (err, db) => {
      if (err) return reject(err);

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
  });
}
