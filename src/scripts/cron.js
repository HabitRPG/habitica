var assert = require('assert');

var moment = require('moment');
var async = require('async');

var shared = require('habitrpg-shared');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;

function constructCronQuery(options) {
    if (options.currentHour == undefined)
        options.currentHour = moment().get('hour');
    if (options.includeMissed == undefined) {
        options.includeMissed = true;
    }
    options.includeInactives = options.includeInactives || false;
    options.force = options.force || false;
    var query = {};
    // only run cron for specific users
    if (options.users) {
        query._id = {$in: options.users};
    }
    // if includeInactives = false, we don't run for users with hp <= 0
    if (!options.includeInactives) {
        query = {$and:[{'stats.hp':{$gt:0}}, query]};
    }
    // if force = true, don't verify CDS setting
    if (!options.force) {
        query = {$and:[{'cronTime': options.currentHour}, query]};
    }
    // if true, include any people with lastCron more than 24 hours from now (not currenHour)
    if (options.includeMissed) {
        var yesterday = moment().subtract('d', 1);
        query = {$or:[{'lastCron': {$lt: yesterday}}, query]};
    }
    return query;
}


module.exports.runCron = function(options, callback) {
    var query = constructCronQuery(options);
    var now = moment().set('hour', options.currentHour);
    console.log("Cron started at " + now.format());
    console.log("Procesing cron for users where cronTime == " + now.get('hour'));
    User.find(query, function(err, users) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        console.log("Found " + users.length + " users.");

        async.parallel(users.map(function(user) {
            return function(cb) {
                // Sanity check!
                var userTime = moment(now).zone(user.preferences.timezoneOffset || 0);
                assert(userTime.isSame(now, 'hour'), "It isn't time to run cron for user " + user._id);

                var progress = user.fns.cron();
                var ranCron = user.isModified();
                var quest = shared.content.quests[user.party.quest.key];

                if (!quest) {
                    return user.save(function(err, saved) {
                        cb(err, saved._id);
                    });
                };

                // If user is on a quest, roll for boss & player, or handle collections
                // FIXME this saves user, runs db updates, loads user. Is there a better way to handle this?
                async.waterfall([
                    function(cb){
                        user.save(cb); // make sure to save the cron effects
                    },
                    function(saved, count, cb){
                        var type = quest.boss ? 'boss' : 'collect';
                        Group[type+'Quest'](user,progress,cb);
                    },
                ], function(err, saved) {
                    cb(err, saved._id);
                });
            };

        }), callback);
    });
}
