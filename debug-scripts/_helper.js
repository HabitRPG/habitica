import { MongoClient as mongo } from 'mongodb';
import config from '../config';

module.exports.updateUser = (_id, path, value) => {
  mongo.connect(config.NODE_DB_URI, (err, db) => {
    if (err) throw err;

    let collection = db.collection('users');
    collection.updateOne(
      { _id },
      { $set: { [`${path}`]: value } },
      (updateErr, result) => {
        if (updateErr) throw updateErr;
        console.log('done updating', _id);
        db.close();
      }
    );
  });
}
