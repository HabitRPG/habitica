/*jslint node: true */
/*global describe, before, beforeEach, afterEach, it*/
'use strict';

var util = require('util');

var _ = require('lodash');
var expect = require('expect.js');
var async = require('async');
var moment = require('moment');
var mongoose = require('mongoose');
var shared = require('habitrpg-shared');
var nconf = require('nconf');
var sinon = require('sinon');
var diff = require('deep-diff');
var cron = require('../src/scripts/cron');
var utils = require('../src/utils');
var logging = require('../src/logging');
var User = require('../src/models/user').model;

// helper to split a string into an array or strings
// copied from habitrpg-shared/tests/algos.mocha.coffee
function $w(s) { return s.split(' '); }

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
            expect(err).to.be.ok();
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
        if (options && options.now) now = options.now;
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
    describe("affected fields", function() {
        it("stats are the same after cron with no dailies",function(done) {
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
                    user.dailys = [];
                    // TODO: remove once user is set with max MP at default
                    user.stats.mp = shared.wrap(user)._statsComputed.maxMP;
                    user.save(cb);
                }, function(user, cb) {
                    expect(user.dailys).to.be.empty();
                    var before = _.cloneDeep(user.toObject());
                    // Run Cron
                    testCron(user, {}, true, function(err, after) {
                        after = after.toObject();
                        // Buffs are currently affected by perfect days. TODO: remove
                        delete before.stats.buffs;
                        delete after.stats.buffs;
                        var userDiff = diff(before.stats, after.stats);
                        expect(userDiff).to.be(undefined);
                        done();
                    });
                }
            ]);
        });
    });
    describe('matrix', function() {
        /**
         This section runs through a "cron matrix" of all permutations (that I can easily account for). It sets
         task due days, user custom day start, timezoneOffset, etc - then runs cron, jumps to tomorrow and runs cron,
         and so on - testing each possible outcome along the way
         */
        function runCronInTimezones(options) {
            _.each([480, 240, 0, -120], function(timezoneOffset) { // test different timezones
                var now = shared.startOfWeek({timezoneOffset:timezoneOffset}).set('h', options.currentHour||0);
                var dayStart =  options.dayStart || 0;
                var lastCron = moment(now).subtract('h', options.hoursAgo || 23);

                async.waterfall([
                    function(cb) {
                        createTestUser(cb, {
                            'lastCron':lastCron,
                            'preferences.timezoneOffset': timezoneOffset,
                            'preferences.dayStart': dayStart
                        });
                    }, function(user, cb) {
                        if (options.repeat) {
                            user.dailys[0].repeat = options.repeat;
                            user.dailys[0].streak = 10;
                        }
                        if (options.checked) {
                            user.dailys[0].completed = true;
                        }
                        if (options.limitOne && options.limitOne == 'daily') {
                            user.dailys = user.dailys.slice(0,1);
                        }
                        // TODO: remove once user is set with max MP at default
                        user.stats.mp = shared.wrap(user)._statsComputed.maxMP;
                        user.save(cb);
                    }, function(user, num, cb) {
                        var before = _.cloneDeep(user.toObject());
                        // Run Cron
                        var expect = options.expect != 'noChange';
                        testCron(user, {}, expect, function(err, after) { cb(err, before, after);});
                    }, function(before, after) {
                        after = after.toObject();
                        if (options.shouldDo) {
                            expect(shared.shouldDo(now, options.repeat,
                                                   {timezoneOffset:timezoneOffset,
                                                    dayStart:options.dayStart,
                                                    now:now})).to.be.ok();
                        }
                        switch(options.expect) {
                        case 'losePoints':
                            expectLostPoints(before,after,'daily');
                            break;
                        case 'noChange':
                            expectNoChange(before,after);
                            break;
                        case 'noDamage':
                            expectDayResetNoDamage(before,after);
                            break;
                        }
                    }
                ]);
            });
        };

        // modified from habitrpg-shared/tests/algos.mocha.coffee
        function expectLostPoints(before, after, taskType) {
            if (taskType in ['daily','habit']) {
                expect(after.stats.hp).to.be.lessThan(before.stats.hp);
                expect(after[taskType + "s"][0].history).to.have.length(1);
            } else {
                expect(after.history.todos).to.have.length(1);
                expect(after.stats.exp).to.be(0);
                expect(after.stats.gp).to.be(0);
                expect(after[taskType + "s"][0].value).to.be.lessThan(before[taskType+"s"][0].value);
            }
        }

        // modified from habitrpg-shared/tests/algos.mocha.coffee
        function expectNoChange(before, after) {
            _.each($w('stats items gear dailys todos rewards flags preferences'), function(attr) {
                expect(diff(before[attr], after[attr])).to.be(undefined);
            });
        };
        // modified from habitrpg-shared/tests/algos.mocha.coffee
        function expectDayResetNoDamage(before, after) {
            _.each(after.dailys, function(task,i) {
                expect(task.completed).to.be(false);
                expect(before.dailys[i].value).to.be(task.value);
                expect(before.dailys[i].streak).to.be(task.streak);
                expect(task.history).to.have.length(1);
            });
            _.each(after.todos, function(task,i) {
                expect(task.completed).to.be(false);
                expect(before.todos[i].value).to.be.greaterThan(task.value);
            });
            expect(after.history.todos).to.have.length(1);
            // hack so we can compare user before/after obj equality sans effected paths
            before = _.cloneDeep(before);
            after = _.cloneDeep(after);
            _.each([before,after], function(obj) {
                delete obj.stats.buffs;
                _.each($w('dailys todos history lastCron'), function(path) { delete obj[path];});
            });
            delete after._tmp;
            expectNoChange(before, after);
        }

        function repeatWithoutLastWeekday() {
            var repeat = {su:1,m:1,t:1,w:1,th:1,f:1,s:1};
            if(shared.startOfWeek(moment().zone(0)).isoWeekday() == 1) // Monday
                repeat.su = false;
            else
                repeat.s = false;
            return repeat;
        };

        var cronMatrix = {
            steps: {
                'due yesterday': {
                    defaults: {hoursAgo:23, limitOne: 'daily'},
                    steps: {
                        '(simple)': {hoursAgo: 25, expect:'losePoints'},
                        'due today': {
                            // NOTE: a strange thing here, moment().startOf('week') is Sunday, but moment.zone(myTimeZone).startOf('week') is Monday.
                            defaults: {repeat:{su:1,m:true,t:1,w:1,th:1,f:1,s:1}},
                            steps: {
                                'pre-dayStart': {
                                    defaults: {currentHour:3, dayStart:4, shouldDo:true},
                                    steps: {
                                        'checked': {checked: true, expect:'noChange'},
                                        'un-checked': {checked: false, expect:'noChange'}
                                    }
                                },
                                'post-dayStart': {
                                    defaults: {hoursAgo: 25, currentHour:5, dayStart:4, shouldDo:true},
                                    steps: {
                                        'checked': {checked:true, expect:'noDamage'},
                                        'unchecked': {checked:false, expect: 'losePoints'}
                                    }
                                }
                            }
                        },
                        'NOT due today': {
                            defaults: {repeat:{su:1,m:false,t:1,w:1,th:1,f:1,s:1}},
                            steps: {
                                'pre-dayStart': {
                                    defaults: {currentHour:3, dayStart:4, shouldDo:true},
                                    steps: {
                                        'checked': {checked: true, expect:'noChange'},
                                        'un-checked': {checked: false, expect:'noChange'}
                                    }
                                },
                                'post-dayStart': {
                                    defaults: {hoursAgo: 25, currentHour:5, dayStart:4, shouldDo:false},
                                    steps: {
                                        'checked': {checked:true, expect:'noDamage'},
                                        'unchecked': {checked:false, expect: 'losePoints'}
                                    }
                                }
                            }
                        }
                    },
                    'not due yesterday': {
                        defaults: {repeat: repeatWithoutLastWeekday(), hoursAgo: 23},
                        steps: {
                            '(simple)': {expect:'noDamage'},
                            'post-dayStart': {hoursAgo:25, currentHour:5,dayStart:4, expect:'noDamage'},
                            'pre-dayStart': {currentHour:3, dayStart:4, expect:'noChange'}
                        }
                    }
                }
            }
        };
        (function recurseCronMatrix(obj, options) {
            options = options || {};
            if (obj.steps) {
                _.each(obj.steps, function(step, text) {
                    var o = _.cloneDeep(options);
                    if (o.text == undefined) o.text = '';
                    o.text += util.format(" %s ", text);
                    recurseCronMatrix(step, _.extend(o,obj.defaults));
                });
            } else {
                it(options.text, function() {runCronInTimezones(_.defaults(obj,options));});
            }
        })(cronMatrix);
    });


    describe('preening', function() {
        beforeEach(function() {
            this.clock = sinon.useFakeTimers(Date.parse("2013-11-20"), "Date");
        });

        afterEach(function() {
            this.clock.restore();
        });

        it('should preen user history', function(done) {
            var history = [
                // Last year should be condensed to one entry, avg: 1
                {date:'09/01/2012', value: 0},
                {date:'10/01/2012', value: 0},
                {date:'11/01/2012', value: 2},
                {date:'12/01/2012', value: 2},
                // Each month of this year should be condensed to 1/mo, averages follow
                {date:'01/01/2013', value: 1}, // 2
                {date:'01/15/2013', value: 3},

                {date:'02/01/2013', value: 2}, //3
                {date:'02/15/2013', value: 4},

                {date:'03/01/2013', value: 3}, //4
                {date:'03/15/2013', value: 5},

                {date:'04/01/2013', value: 4}, //5
                {date:'04/15/2013', value: 6},

                {date:'05/01/2013', value: 5}, //6
                {date:'05/15/2013', value: 7},

                {date:'06/01/2013', value: 6}, //7
                {date:'06/15/2013', value: 8},

                {date:'07/01/2013', value: 7}, //8
                {date:'07/15/2013', value: 9},

                {date:'08/01/2013', value: 8}, //9
                {date:'08/15/2013', value: 10},

                {date:'09/01/2013', value: 9}, //10
                {date:'09/15/2013', value: 11},

                {date:'010/01/2013', value: 10}, //11
                {date:'010/15/2013', value: 12},

                // This month should condense each week
                {date:'011/01/2013', value: 12},
                {date:'011/02/2013', value: 13},
                {date:'011/03/2013', value: 14},
                {date:'011/04/2013', value: 15}
            ];
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
                    user.history = {exp: _.cloneDeep(history), todos: _.cloneDeep(history)};
                    user.habits[0].history = _.cloneDeep(history);
                    user.save(cb);
                }, function(user, cb) {
                    // Run Cron
                    testCron(user, {}, true, function(err, after) {
                        after = after.toObject();
                        // remove history entries created by cron
                        after.history.exp.pop();
                        after.history.todos.pop();
                        _.each([after.history.exp, after.history.todos, after.habits[0].history], function(arr) {
                            expect(_.pluck(arr, 'value')).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
                        });
                        done();
                    });
                }
            ]);
        });
    });
});
