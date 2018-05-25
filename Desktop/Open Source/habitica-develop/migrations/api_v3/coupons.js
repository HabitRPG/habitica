// Migrate coupons collection to new schema

// The console-stamp module must be installed (not included in package.json)

// It requires two environment variables: MONGODB_OLD and MONGODB_NEW

// Due to some big user profiles it needs more RAM than is allowed by default by v8 (arounf 1.7GB).
// Run the script with --max-old-space-size=4096 to allow up to 4GB of RAM
console.log('Starting migrations/api_v3/coupons.js.');

// IMPORTANT NOTE: this migration was written when we were using version 3 of lodash.
// We've now upgraded to lodash v4 but the code used in this migration has not been
// adapted to work with it. Before this migration is used again any lodash method should
// be checked for compatibility against the v4 changelog and changed if necessary.
// https://github.com/lodash/lodash/wiki/Changelog#v400

require('babel-register');
require('babel-polyfill');

var Bluebird = require('bluebird');
var MongoDB = require('mongodb');
var nconf = require('nconf');
var mongoose = require('mongoose');
var _ = require('lodash');
var uuid = require('uuid');
var consoleStamp = require('console-stamp');

// Add timestamps to console messages
consoleStamp(console);

// Initialize configuration
require('../../website/server/libs/api-v3/setupNconf')();

var MONGODB_OLD = nconf.get('MONGODB_OLD');
var MONGODB_NEW = nconf.get('MONGODB_NEW');

var MongoClient = MongoDB.MongoClient;

mongoose.Promise = Bluebird; // otherwise mongoose models won't work

// Load new models
var Coupon = require('../../website/server/models/coupon').model;

// To be defined later when MongoClient connects
var mongoDbOldInstance;
var oldCouponCollection;

var mongoDbNewInstance;
var newCouponCollection;

var BATCH_SIZE = 1000;

var processedCoupons = 0;

// Only process coupons that fall in a interval ie -> up to 0000-4000-0000-0000
var AFTER_COUPON_ID = nconf.get('AFTER_COUPON_ID');
var BEFORE_COUPON_ID = nconf.get('BEFORE_COUPON_ID');

function processCoupons (afterId) {
  var processedTasks = 0;
  var lastCoupon = null;
  var oldCoupons;

  var query = {};

  if (BEFORE_COUPON_ID) {
    query._id = {$lte: BEFORE_COUPON_ID};
  }

  if ((afterId || AFTER_COUPON_ID) && !query._id) {
    query._id = {};
  }

  if (afterId) {
    query._id.$gt = afterId;
  } else if (AFTER_COUPON_ID) {
    query._id.$gt = AFTER_COUPON_ID;
  }

  var batchInsertCoupons = newCouponCollection.initializeUnorderedBulkOp();

  console.log(`Executing coupons query.\nMatching coupons after ${afterId ? afterId : AFTER_COUPON_ID} and before ${BEFORE_COUPON_ID} (included).`);

  return oldCouponCollection
  .find(query)
  .sort({_id: 1})
  .limit(BATCH_SIZE)
  .toArray()
  .then(function (oldCouponsR) {
    oldCoupons = oldCouponsR;

    console.log(`Processing ${oldCoupons.length} coupons. Already processed ${processedCoupons} coupons.`);

    if (oldCoupons.length === BATCH_SIZE) {
      lastCoupon = oldCoupons[oldCoupons.length - 1]._id;
    }

    oldCoupons.forEach(function (oldCoupon) {
      var newCoupon = new Coupon(oldCoupon);

      batchInsertCoupons.insert(newCoupon.toObject());
    });

    console.log(`Saving ${oldCoupons.length} coupons.`);

    return batchInsertCoupons.execute();
  })
  .then(function () {
    processedCoupons += oldCoupons.length;

    console.log(`Saved ${oldCoupons.length} coupons.`);

    if (lastCoupon) {
      return processCoupons(lastCoupon);
    } else {
      return console.log('Done!');
    }
  });
}

// Connect to the databases
Bluebird.all([
  MongoClient.connect(MONGODB_OLD),
  MongoClient.connect(MONGODB_NEW),
])
.then(function (result) {
  var oldInstance = result[0];
  var newInstance = result[1];

  mongoDbOldInstance = oldInstance;
  oldCouponCollection = mongoDbOldInstance.collection('coupons');

  mongoDbNewInstance = newInstance;
  newCouponCollection = mongoDbNewInstance.collection('coupons');

  console.log(`Connected with MongoClient to ${MONGODB_OLD} and ${MONGODB_NEW}.`);

  return processCoupons();
})
.catch(function (err) {
  console.error(err.stack || err);
});
