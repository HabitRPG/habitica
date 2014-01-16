/*jslint node: true */
/*global describe, before, beforeEach, it*/
'use strict';

var _ = require('lodash');
var expect = require('expect.js');
var async = require('async');
var moment = require('moment');
var mongoose = require('mongoose');
var shared = require('habitrpg-shared');
var nconf = require('nconf');

var cron = require('../src/scripts/cron');
var utils = require('../src/utils');
var User = require('../src/models/user').model;

describe('runCron', function () {
    var db;
    before(function() {
        utils.setupConfig();
        db = mongoose.connect('mongodb://localhost/habitrpg-test',  function(err) {
            if (err) throw err;
        });
    });

    after(function() {
        db.connection.db.dropDatabase(function(err) {
            expect(err).to.not.be.ok();
            db.connection.close();
        });
    });

    function createTestUser(cb, options) {
        var randomID = shared.uuid();
        var salt = utils.makeSalt();
        var newUser = {
            auth: {
                local: {
                    username: randomID,
                    email: randomID + 'example.com',
                    salt: salt,
                    hashed_password: utils.encryptPassword(randomID, salt)
                },
                timestamps: {created: +new Date(), loggedIn: +new Date()}
            }
        };
        _.assign(newUser, options);
        var user = new User(newUser);
        user.save(function(err, saved) {
            expect(err).to.not.be.ok();
            expect(saved).to.be.ok();
            cb(err, saved);
        });
    };

    // Runs cron and checks to see if the user was affected.
    // expected is a boolean indicating if we expected the user
    // to have been affected by cron (lastCron updated).
    function testCron(user, options, expected, cb) {
        var now = moment();
        var lastCron = user.lastCron;
        cron.runCron((options || {}), function(err, results) {
            User.findById(user.id, function(err, user) {
                if (expected) {
                    expect(moment(user.lastCron).isSame(now, 'm')).to.be.ok();
                } else {
                    expect(moment(user.lastCron).isSame(lastCron, 'm')).to.be.ok();
                }
                cb(err, user);
            });
        });
    }

    describe('with default options:', function () {
        it('does not run cron if before dayStart', function (done) {
            var now = moment();
            var dayStart =  moment(now).add('h', 1).get('hour');
            var lastCron =  moment(now).subtract('h', 23);
            async.waterfall([
                function(cb) {
                    // Create a new user to test with.
                    createTestUser(cb, {
                        'lastCron':lastCron,
                        'preferences.timezoneOffset': now.zone(),
                        'preferences.dayStart': dayStart
                    });
                }, function(user, cb) {
                    // Make sure cronTime was set properly
                    expect(user.cronTime).to.be(dayStart);
                    // Run Cron
                    testCron(user, null, false, done);
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });

        // This is the scenario we are having where users' dailies are not resetting
        it('runs cron if now == dayStart and lastCron after midnight', function (done) {
            var now = moment();
            var dayStart =  now.get('hour'); // dayStart time is now.
            // lstCron will be between now and midnight.
            var lastCron;
            if (now.get('hour') != 0) {
               lastCron =  moment(now).subtract('hour', 1);
            } else {
                // this scenario isn't valid if the current hour is midnight.
                return done();
            }

            async.waterfall([
                function(cb) {
                    // Create a new user to test with.
                    createTestUser(cb, {
                        'lastCron':lastCron,
                        'preferences.timezoneOffset': now.zone(),
                        'preferences.dayStart': dayStart
                    });
                }, function(user, cb) {
                    // Make sure cronTime was set properly
                    expect(user.cronTime).to.be(dayStart);
                    // Run Cron
                    testCron(user, null, true, done);
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });

        it('runs cron when now == dayStart', function (done) {
            var now = moment();
            var dayStart =  moment(now).get('hour');
            var lastCron =  moment(now).subtract('h', 23);
            async.waterfall([
                function(cb) {
                    // Create a new user to test with.
                    createTestUser(cb, {
                        'lastCron':lastCron,
                        'preferences.timezoneOffset': now.zone(),
                        'preferences.dayStart': dayStart
                    });
                }, function(user, cb) {
                    // Make sure cronTime was set properly
                    expect(user.cronTime).to.be(dayStart);
                    // Run Cron
                    testCron(user, null, true, done);
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });

        it('includeMissed: runs cron if cron was missed (> 24 hours ago)', function (done) {
            var now = moment();
            var dayStart =  moment(now).add('h', 4).get('hour'); // dayStart is not now!
            var lastCron =  moment(now).subtract('h', 26); // more than a day ago!
            async.waterfall([
                function(cb) {
                    // Create a new user to test with.
                    createTestUser(cb, {
                        'lastCron':lastCron,
                        'preferences.timezoneOffset': now.zone(),
                        'preferences.dayStart': dayStart
                    });
                }, function(user,cb) {
                    // Make sure cronTime was set properly
                    expect(user.cronTime).to.be(dayStart);
                    // Verify that cronTime isn't the current hour
                    expect(user.cronTime).to.not.be(now.get('hour'));
                    // Run Cron
                    testCron(user, null, true, done);
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });

        it('!includeInactives: does not run cron if hp <= 0', function (done) {
            var now = moment();
            var dayStart =  moment(now).add('h', 1).get('hour');
            var lastCron =  moment(now).subtract('h', 26); // more than a day ago!
            async.waterfall([
                function(cb) {
                    // Create a new user to test with.
                    createTestUser(cb, {
                        'lastCron':lastCron,
                        'preferences.timezoneOffset': now.zone(),
                        'preferences.dayStart': dayStart,
                        'stats.hp':0
                    });
                }, function(user, cb) {
                    // Make sure cronTime was set properly
                    expect(user.cronTime).to.be(dayStart);
                    // Run Cron
                    testCron(user, null, false, done);
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });
    });

    describe('runCron with non-default options', function () {
        it('users: run cron only for explicit users', function(done) {
            var now = moment();
            var dayStart =  moment(now).get('hour');
            var lastCron =  moment(now).subtract('h', 2);
            async.waterfall([
                function(cb) {
                    async.parallel([
                        function(cb) {
                            createTestUser(cb, {
                                'lastCron':lastCron,
                                'preferences.timezoneOffset': now.zone(),
                                'preferences.dayStart': dayStart
                            });
                        },
                        function(cb) {
                            createTestUser(cb, {
                                'lastCron':lastCron,
                                'preferences.timezoneOffset': now.zone(),
                                'preferences.dayStart': dayStart
                            });
                        }
                    ], cb);
                }, function(users,  cb) {
                    // Run Cron
                    testCron(users[0], {users:[users[0]._id]}, true, function(err, user) {
                        cb(err, users);
                    });
                }, function(users, cb) {
                    User.findById(users[1]._id, cb);
                }, function(user1, cb) {
                    // Verify users[1] (which wasn't explicitly passed) did not have cron run.
                    expect(moment(user1.lastCron).isSame(lastCron, 'm')).to.be.ok();
                    done();
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });

        it('!includeMissed: does not run if cron was missed', function(done) {
            var now = moment();
            var dayStart =  moment(now).add('h', 1).get('hour');
            var lastCron =  moment(now).subtract('h', 26); // more than a day ago!
            async.waterfall([
                function(cb) {
                    createTestUser(cb, {
                        'lastCron':lastCron,
                        'preferences.timezoneOffset': now.zone(),
                        'preferences.dayStart': dayStart
                    });
                }, function(user,  cb) {
                    // Make sure cronTime was set properly
                    expect(user.cronTime).to.be(dayStart);
                    // Run Cron
                    testCron(user, {includeMissed:false}, false, done);
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });

        it('force: runs cron for user even if now != cronTime', function(done) {
            var now = moment();
            var dayStart =  moment(now).add('h', 1).get('hour');
            var lastCron =  moment(now).subtract('h', 1);
            async.waterfall([
                function(cb) {
                    createTestUser(cb, {
                        'lastCron':lastCron,
                        'preferences.timezoneOffset': now.zone(),
                        'preferences.dayStart': dayStart
                    });
                }, function(user,  cb) {
                    // Make sure cronTime was set properly
                    expect(user.cronTime).to.be(dayStart);
                    // Run Cron
                    testCron(user, {force:true}, true, done);
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });

        it('includeInactives: runs cron even if hp <= 0', function (done) {
            var now = moment();
            var dayStart =  moment(now).add('h', 1).get('hour');
            var lastCron =  moment(now).subtract('h', 26); // more than a day ago!
            async.waterfall([
                function(cb) {
                    createTestUser(cb, {
                        'lastCron':lastCron,
                        'preferences.timezoneOffset': now.zone(),
                        'preferences.dayStart': dayStart,
                        'stats.hp':0
                    });
                }, function(user,  cb) {
                    // Make sure cronTime was set properly
                    expect(user.cronTime).to.be(dayStart);
                    // Run Cron
                    testCron(user, {includeInactives:true}, true, done);
                }
            ], function(err) {
                expect(err).to.not.be.ok();
            });
        });
    });
});
