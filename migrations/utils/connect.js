'use strict';

const MongoClient = require('mongodb').MongoClient;
const logger = require('./logger');

let db;

function connectToDb (dbUri) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbUri, (err, database) => {
      if (err) {
        logger.error(`Uh oh... Problem connecting to the database at ${dbUri}`);
        return reject(err);
      }

      db = database;

      logger.success(`Connected to ${dbUri}`);

      resolve(database);
    });
  });
}

function closeDb () {
  if (db) db.close();

  logger.success('Closed connection to the database');
  return Promise.resolve();
}

module.exports = {
  connectToDb,
  closeDb,
}
