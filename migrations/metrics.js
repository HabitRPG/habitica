// node habitrpg ./migrations/metrics.js

let EXPORT_EMAILS = true;
let mongo = require('mongoskin');
let csv = require('csv');
let _ = require('lodash');
let moment = require('moment');
let db = mongo.db('localhost:27017/habitrpg?auto_reconnect');
let twoWeeksAgo = moment().subtract(14, 'days');
let angularRewrite = moment('07/09/2013');

let query = {auth: {$exists: 1}};
let fields = {lastCron: 1, 'history.exp': 1, 'auth.timestamps': 1, 'auth.local.email': 1};
db.collection('users').find(query, fields).toArray(function (err, items) {
  if (err) return console.error({err});
  let stats = {total: _.size(items), lostToDerby: 0, isActive: 0};
  let emails = [];
  _.each(items, function (item) {
    // if (!item.history || !item.history.exp) console.log(item._id)

    // var hasBeenActive = item.history && item.history.exp && item.history.exp.length > 7;
    let hasBeenActive = item.auth.timestamps && item.auth.timestamps.created &&
      Math.abs(moment(item.lastCron).diff(item.auth.timestamps.created, 'd')) > 14;

    if (/* hasBeenActive && */moment(item.lastCron).isBefore(angularRewrite)) {
      stats.lostToDerby++;
      if (item.auth.local)
        emails.push([item.auth.local.email]);
      // Facebook emails. Kinda dirty, and there's only ~30 available fb emails anyway.
      //    } else if (item.auth.facebook && item.auth.facebook.email) {
      //      emails.push([item.auth.facebook.email])
      //    } else if (item.auth.facebook && item.auth.facebook.emails && item.auth.facebook.emails[0] && !!item.auth.facebook.emails[0].value) {
      //      emails.push([item.auth.facebook.emails[0].value])
    }
    if (hasBeenActive && moment(item.lastCron).isAfter(twoWeeksAgo)) {
      stats.isActive++;
    }
  });
  stats.emails = _.size(emails);
  console.log(stats);

  if (EXPORT_EMAILS)
    csv().from.array(emails).to.path(`${__dirname}/emails.csv`);
});

/*
load('./node_modules/moment/moment.js');
var today = +new Date,
    twoWeeksAgo = +moment().subtract(14, 'days');

    corrupt = {
        $or: [
            {lastCron: {$exists:false}},
            {lastCron: 'new'}
        ]
    }

    un_registered = {
        "auth.local": {$exists: false},
        "auth.facebook": {$exists: false}
    },

    registered = {
        $or: [
            { 'auth.local': { $exists: true }},
            { 'auth.facebook': { $exists: true }}
        ]
    },

    active = {
        $or: [
            { 'auth.local': { $exists: true }},
            { 'auth.facebook': { $exists: true }}
        ],
        $where: function(){
            return this.history && this.history.exp && this.history.exp.length > 7;
        },
        'lastCron': {$gt: twoWeeksAgo}
    };

print('corrupt: ' + db.users.count(corrupt));
print('unregistered: ' + db.users.count(un_registered));
print('registered: ' + db.users.count(registered));
print('active: ' + db.users.count(active));
*/