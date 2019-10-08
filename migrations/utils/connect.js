
const { MongoClient } = require('mongodb');
const logger = require('./logger');

let dbConnection;

function connectToDb (dbUri) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUri, (err, database) => {
      if (err) {
        logger.error(`Uh oh... Problem connecting to the database at ${dbUri}`);
        return reject(err);
      }

      dbConnection = database;

      logger.success(`Connected to ${dbUri}`);

      resolve(database);
    });
  });
}

function closeDb () {
  if (dbConnection) dbConnection.close();

  logger.success('Closed connection to the database');
  return Promise.resolve();
}

module.exports = {
  connectToDb,
  closeDb,
};
