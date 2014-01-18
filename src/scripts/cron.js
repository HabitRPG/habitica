var assert = require('assert');

var moment = require('moment');
var async = require('async');

var shared = require('habitrpg-shared');
var User = require('./../models/user').model;
var Group = require('./../models/group').model;
var logging = require('./../logging');

function constructCronQuery(options) {
    if (options.currentHour == undefined)
        options.currentHour = moment().get('hour');
    if (options.includeMissed == undefined) {
        options.includeMissed = true;
    }
    options.includeInactives = options.includeInactives || false;
    options.force = options.force || false;
    // Note that ordering of these matters!
    var query = {};
    // only run cron for specific users
    if (options.users) {
        query._id = {$in: options.users};
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
    // if includeInactives = false, we don't run for users with hp <= 0
    if (!options.includeInactives) {
        query = {$and:[{'stats.hp':{$gt:0}}, query]};
    }
    return query;
}


module.exports.runCron = function(options, callback) {
    var query = constructCronQuery(options);
    var now = moment().set('hour', options.currentHour);
    logging.info("Cron started at %s. cronTime == %d", now.format(), now.get('hour'));
    var toProcess = 0;
    var processed = 0;
    var streamClosed = false;
    var saved = [];
    var errors = [];
    var maxMem = 0;
    var done = function(user) {
        return function(err) {
            processed++;
            if (err) {
                errors.push(err);
            } else {
                saved.push(user._id);
            }
            if (streamClosed && processed == toProcess) {
                logging.info("Cron maximum memory usage: %d MB", maxMem / 1000 / 1000);
                callback(errors, saved);
            }
        };
    };
    var stream = User.find(query).batchSize(5).stream();
    stream.on('data', function(user) {
        toProcess++;
        var mem = process.memoryUsage();
        if (mem.rss > maxMem) maxMem = mem.rss;
        var progress = user.fns.cron();
        var ranCron = user.isModified();
        var quest = shared.content.quests[user.party.quest.key];

        if (!quest) {
            return user.save(done(user));
        }
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
        ], done(user));
    }).on('error', function(err) {
        errors.push(err);
    }).on('close', function() {
        streamClosed = true;
    });
}
