/*jslint node: true */
/*global describe, before, beforeEach, it*/
'use strict';

var _ = require('lodash');
var expect = require('expect.js');
var async = require('async');
var diff = require('deep-diff');
var superagentDefaults = require('superagent-defaults');

var request = superagentDefaults();

var conf = require('nconf');
conf.argv().env().file({file: __dirname + '../config.json'}).defaults();
conf.set('port','1337');

// Override normal ENV values with nconf ENV values (ENV values are used the same way without nconf)
// FIXME can't get nconf file above to load...
process.env.BASE_URL = conf.get("BASE_URL");
process.env.FACEBOOK_KEY = conf.get("FACEBOOK_KEY");
process.env.FACEBOOK_SECRET = conf.get("FACEBOOK_SECRET");
process.env.NODE_DB_URI = 'mongodb://localhost/habitrpg';

var User = require('../src/models/user').model;
var Group = require('../src/models/group').model;
var Challenge = require('../src/models/challenge').model;

var app = require('../src/server');
var shared = require('habitrpg-shared');
var payments = require('../src/controllers/payments');

// ###### Helpers & Variables ######
var model, uuid, taskPath,
baseURL = 'http://localhost:3000/api/v2';

var expectCode = function (res, code) {
  if (code == 200)
    expect(res.body.err).to.be(undefined);
  expect(res.statusCode).to.be(code);
};

describe('API', function () {
  var user, _id, apiToken, username, password;

  var registerNewUser = function(cb, main) {
    if (main === undefined) main = true;

    var randomID = shared.uuid();
    if (main) {
      username = password = randomID;
    }

    request.post(baseURL + "/register")
    .set('Accept', 'application/json')
    .send({
      username: randomID,
      password: randomID,
      confirmPassword: randomID,
      email: randomID + "@gmail.com"
    })
    .end(function (res) {
      if (!main) return cb(null, res.body);

      _id = res.body._id;
      apiToken = res.body.apiToken;
      User.findOne({_id: _id,
                   apiToken: apiToken},
                   function (err, _user) {
                     expect(err).to.not.be.ok();
                     user = _user;
                     request
                     .set('Accept', 'application/json')
                     .set('X-API-User', _id)
                     .set('X-API-Key', apiToken);
                     cb(null, res.body);
                   });
    });
  };

  before(function (done) {
    require('../src/server'); // start the server
    // then wait for it to do it's thing. TODO make a cb-compatible export of server
    setTimeout(done, 2000);
  });

  describe('Without token or user id', function () {
    it('/api/v2/status', function (done) {
      request.get(baseURL + "/status")
      .set('Accept', 'application/json')
      .end(function (res) {
        expect(res.statusCode).to.be(200);
        expect(res.body.status).to.be('up');
        done();
      });
    });

    it('/api/v2/user', function (done) {
      request.get(baseURL + "/user")
      .set('Accept', 'application/json')
      .end(function (res) {
        expect(res.statusCode).to.be(401);
        expect(res.body.err).to.be('You must include a token and uid (user id) in your request');
        done();
      });
    });
  });

  describe('With token and user id', function () {

    before(function (done) {
      registerNewUser(done, true);
    });

    beforeEach(function (done) {
      User.findById(_id, function (err, _user) {
        user = _user;
        shared.wrap(user);
        done();
      });
    });


    describe('Todos', function(){
      it('Archives old todos',function(done){
        request.post(baseURL + "/user/batch-update?_v=999")
        .send([
          {op:'addTask',body:{type:'todo'}},
          {op:'addTask',body:{type:'todo'}},
          {op:'addTask',body:{type:'todo'}}
        ])
        .end(function (res) {

          expectCode(res, 200);
          expect(_.size(res.body.todos)).to.be(6);
          request.post(baseURL + "/user/batch-update?_v=998")
          .send([
            {op:'score',params:{direction:'up', id:res.body.todos[0].id}},
            {op:'score',params:{direction:'up', id:res.body.todos[1].id}},
            {op:'score',params:{direction:'up', id:res.body.todos[2].id}}
          ])
          .end(function(res){
            expectCode(res, 200);
            expect(_.size(res.body.todos)).to.be(6);
            request.post(baseURL + "/user/batch-update?_v=997")
            .send([
              {op:'updateTask',params:{id:res.body.todos[0].id}, body:{dateCompleted:moment().subtract('days',4)}},
              {op:'updateTask',params:{id:res.body.todos[1].id}, body:{dateCompleted:moment().subtract('days',4)}}
            ])
            .end(function(res){
              expect(_.size(res.body.todos)).to.be(4);
              done();
            })
          })
        });
      });
    })

    /**
     * GROUPS
     */
    describe('Groups', function () {
      var group;

      before(function (done) {
        registerNewUser(function(){
          request.post(baseURL + "/groups")
          .send({name:"TestGroup", type:"party"})
          .end(function (res) {
            expectCode(res, 200);
            group = res.body;
            expect(group.members.length).to.be(1);
            expect(group.leader).to.be(user._id);
            done();
            });
          });
        })

      describe('Challenges', function () {
        var challenge, updateTodo;

        it('Creates a challenge', function (done) {
          request.post(baseURL + "/challenges")
          .send({
            group: group._id,
            dailys: [{type:'daily', text:'Challenge Daily'}],
            todos: [{type:'todo', text:'Challenge Todo', notes:'Challenge Notes'}],
            rewards: [],
            habits: [],
            official: true
          })
          .end(function (res) {
            expectCode(res, 200);
            async.parallel([
              function (cb) { User.findById(_id, cb); },
              function (cb) { Challenge.findById(res.body._id, cb); },
              ], function (err, results) {
              var _user = results[0];
              challenge = results[1];
              expect(_user.dailys[_user.dailys.length-1].text).to.be('Challenge Daily');
              updateTodo = _user.todos[_user.todos.length-1];
              expect(updateTodo.text).to.be('Challenge Todo');
              expect(challenge.official).to.be(false);
              done();
              });
            });
        });

        it('User updates challenge notes', function (done) {
          updateTodo.notes = "User overriden notes";
          request.put(baseURL + "/user/tasks/" + updateTodo.id)
          .send(updateTodo)
          .end(function (res) {
            done(); // we'll do the check down below
          });
        });

        it('Change challenge daily', function (done) {
          challenge.dailys[0].text = 'Updated Daily';
          challenge.todos[0].notes = 'Challenge Updated Todo Notes';
          request.post(baseURL + "/challenges/" + challenge._id)
          .send(challenge)
          .end(function (res) {
            setTimeout(function () {
              User.findById(_id, function (err,_user) {
                expectCode(res, 200);
                expect(_user.dailys[_user.dailys.length-1].text).to.be('Updated Daily');
                expect(res.body.todos[0].notes).to.be('Challenge Updated Todo Notes');
                expect(_user.todos[_user.todos.length-1].notes).to.be('User overriden notes');
                user = _user;
                done();
              });
            }, 500); // we have to wait a while for users' tasks to be updated, called async on server
          });
        });

        it('Shows user notes on challenge page', function (done) {
          request.get(baseURL + "/challenges/" + challenge._id + "/member/" + _id)
          .end(function (res) {
            expect(res.body.todos[res.body.todos.length-1].notes).to.be('User overriden notes');
            done();
          });
        });

        it('Complete To-Dos', function (done) {
          var u = user;
          request.post(baseURL + "/user/tasks/" + u.todos[0].id + "/up").end(function (res) {
            request.post(baseURL + "/user/tasks/" + u.todos[1].id + "/up").end(function (res) {
              request.post(baseURL + "/user/tasks/").send({type:'todo'}).end(function (res) {
                request.post(baseURL + "/user/tasks/clear-completed").end(function (res) {
                  expect(_.size(res.body)).to.be(3);
                  done();
                });
              });
            });
          });
        });

        it('Challenge deleted, breaks task link', function (done) {
          var itThis = this;
          request.del(baseURL + "/challenges/" + challenge._id).end(function (res) {
            User.findById(user._id, function(err,user){
              var len = user.dailys.length- 1,
                daily = user.dailys[user.dailys.length-1];
              expect(daily.challenge.broken).to.be('CHALLENGE_DELETED');

              // Now let's handle if challenge was deleted, but didn't get to update all the users (an error)
              var unset = {$unset:{}};
              unset['$unset']['dailys.' + len + '.challenge.broken'] = 1;
              User.findByIdAndUpdate(user._id,unset,function(err,user){
                expect(err).to.not.be.ok();
                expect(user.dailys[len].challenge.broken).to.not.be.ok();
                request.post(baseURL + "/user/tasks/" + daily.id + "/up").end(function (res) {
                  setTimeout(function(){
                    User.findById(user._id,function(err,user){
                      expect(user.dailys[len].challenge.broken).to.be('CHALLENGE_DELETED');
                      done()
                    })
                  }, 100); // we need to wait for challenge to update user, it's a background job for perf reasons
                })
              })
            })
          })
        });

        it('Admin creates a challenge', function (done) {
          User.findByIdAndUpdate(_id, {$set:{'contributor.admin':true}}, function (err,_user) {
            expect(err).to.not.be.ok();

            async.parallel([
              function (cb) {
              request.post(baseURL + "/challenges")
              .send({group:group._id, dailys: [], todos: [], rewards: [], habits: [], official: false}).end(function (res) {
                expect(res.body.official).to.be(false);
                cb();
              });
            },
            function (cb) {
              request.post(baseURL + "/challenges")
              .send({group:group._id, dailys: [], todos: [], rewards: [], habits: [], official: true}).end(function (res) {
                expect(res.body.official).to.be(true);
                cb();
              });
            }], done);
          });
        });
      });

      describe('Quests', function () {
        var party,
            participating = [],
            notParticipating = [];

        before(function(done){

          // Tavern boss, side-by-side
          Group.update({_id:'habitrpg'},{$set:{quest:{
            key:'dilatory',
            active:true,
            progress:{hp:shared.content.quests.dilatory.boss.hp, rage:0}
          }}}).exec();

          // Tally some progress for later. Later we want to test that progress made before the quest began gets
          // counted after the quest starts
          request.post(baseURL+'/user/batch-update')
          .send([
            {op:'score',params:{direction:'up',id:user.dailys[0].id}},
            {op:'score',params:{direction:'up',id:user.dailys[1].id}},
            {op:'update',body:{'stats.lvl':50}}
          ])
          .end(function(res){
            user = res.body;
            expect(user.party.quest.progress.up).to.be.above(0);


            // Invite some members
            async.waterfall([
              // Register new users
              function (cb) {
                async.parallel([
                  function (cb2) { registerNewUser(cb2,false); },
                  function (cb2) { registerNewUser(cb2,false); },
                  function (cb2) { registerNewUser(cb2,false); }
                ], cb);
              },
              // Send them invitations
              function (_party, cb) {
                party = _party;
                var inviteURL = baseURL + "/groups/" + group._id + "/invite?uuid=";
                async.parallel([
                  function (cb2) { request.post(inviteURL + party[0]._id).end(function(){cb2()}) },
                  function (cb2) { request.post(inviteURL + party[1]._id).end(function(){cb2()}) },
                  function (cb2) { request.post(inviteURL + party[2]._id).end(function(){cb2()}) }
                ], cb);
              },
              // Accept / Reject
              function (results, cb) {
                // series since they'll be modifying the same group record
                var series = _.reduce(party, function (m,v,i) {
                  m.push(function (cb2) {
                    request.post(baseURL+"/groups/"+group._id+"/join")
                    .set('X-API-User', party[i]._id)
                    .set('X-API-Key', party[i].apiToken)
                    .end(function(){cb2();});
                  });
                  return m;
                }, [])
                async.series(series, cb);
              },

              // Make sure the invites stuck
              function (whatever, cb) {
                Group.findById(group._id, function (err, g) {
                  group = g;
                  expect(g.members.length).to.be(4);
                  cb();
                });
              }

            ], function(){

              // Start the quest
              async.waterfall([
                function (cb) {
                  request.post(baseURL + "/groups/" + group._id + "/questAccept?key=vice3")
                  .end(function (res) {
                    expectCode(res, 400);
                    User.findByIdAndUpdate(_id, {$set: {'items.quests.vice3':1}}, cb);
                  });
                },
                function (_user,cb) {
                  request.post(baseURL + "/groups/" + group._id + "/questAccept?key=vice3")
                  .end(function (res) {
                    expectCode(res, 200);
                    Group.findById(group._id, cb);
                  });
                },
                function (_group,cb) {
                  expect(_group.quest.key).to.be('vice3');
                  expect(_group.quest.active).to.be(false);

                  request.post(baseURL + "/groups/" + group._id + "/questAccept")
                  .set('X-API-User', party[0]._id).set('X-API-Key', party[0].apiToken)
                  .end(function () {
                    request.post(baseURL + "/groups/" + group._id + "/questAccept")
                    .set('X-API-User', party[1]._id).set('X-API-Key', party[1].apiToken)
                    .end(function (res) {
                      request.post(baseURL + "/groups/" + group._id + "/questReject")
                      .set('X-API-User', party[2]._id).set('X-API-Key', party[2].apiToken)
                      .end(function (res) {
                          group = res.body;
                          expect(group.quest.active).to.be(true);
                          cb();
                      });
                    });
                  })
                }], done);

            });
          })
        });

        it('Casts a spell', function(done){
          var mp = user.stats.mp;
          request.get(baseURL+'/members/'+party[0]._id).end(function(res){
            party[0] = res.body;
            request.post(baseURL+'/user/class/cast/snowball?targetType=user&targetId='+party[0]._id)
            .end(function(res){
              //expect(res.body.stats.mp).to.be.below(mp);
              request.get(baseURL+'/members/'+party[0]._id).end(function(res){
                var member = res.body;
                expect(member.achievements.snowball).to.be(1);
                expect(member.stats.buffs.snowball).to.be(true);
                var difference = diff(member,party[0]);
                expect(_.size(difference)).to.be(2);

                // level up user so str is > 0
                request.put(baseURL+'/user').send({'stats.lvl':5}).end(function(res){
                  // Refill mana so user can cast
                  request.put(baseURL+'/user').send({'stats.mp':100}).end(function(res){
                    request.post(baseURL+'/user/class/cast/valorousPresence?targetType=party').end(function(res){
                      request.get(baseURL+'/members/'+member._id).end(function(res){
                        expect(res.body.stats.buffs.str).to.be.above(0);
                        expect(diff(res.body,member).length).to.be(1);
                        done();
                      })
                    })
                  })
                })
              })
            })
          })
        });

        it("Doesn't include people who aren't participating",function(done){
          request.get(baseURL+'/groups/'+group._id).end(function(res){
            expect(_.size(res.body.quest.members)).to.be(3);
            done();
          })
        });

        it('Hurts the boss',function(done){
          request.post(baseURL+'/user/batch-update')
          .end(function(res){
            user = res.body;
            var up = user.party.quest.progress.up;
            expect(up).to.be.above(0);
            request.post(baseURL+'/user/batch-update')
            .send([
              {op:'score',params:{direction:'up',id:user.dailys[1].id}},
              //{op:'score',params:{direction:'up',id:user.dailys[3].id}}, // leave one daily undone so Trapper hurts party
              {op:'update',body:{lastCron:moment().subtract('days',1)}} // set day to yesterday, cron will then be triggered on next action
            ])
            .end(function(res){
              expect(res.body.party.quest.progress.up).to.be.above(up)
              request.post(baseURL+'/user/batch-update')
              .end(function(){
                request.get(baseURL+'/groups/party').end(function(res){

                  // Check boss damage
                  async.waterfall([
                    function(cb){
                      async.parallel([
                        //tavern boss
                        function(cb2){
                          Group.findById('habitrpg',{quest:1},function(err,tavern){
                            expect(tavern.quest.progress.hp).to.be.below(shared.content.quests.dilatory.boss.hp);
                            expect(tavern.quest.progress.rage).to.be.above(0);
                            console.log({tavernBoss:tavern.quest});
                            cb2();
                          })
                        },
                        // party boss
                        function(cb2){
                          expect(res.body.quest.progress.hp).to.be.below(shared.content.quests.vice3.boss.hp);
                          var _party = res.body.members;
                          expect(_.find(_party,{_id:party[0]._id}).stats.hp).to.be.below(50);
                          expect(_.find(_party,{_id:party[1]._id}).stats.hp).to.be.below(50);
                          expect(_.find(_party,{_id:party[2]._id}).stats.hp).to.be(50);
                          cb2();
                        }
                      ],cb)
                    },

                    // Kill the boss
                    function(whatever,cb){
                      async.waterfall([
                        // tavern boss
                        function(cb2){
                          expect(user.items.pets['MantisShrimp-Base']).to.not.be.ok();
                          Group.update({_id:'habitrpg'},{$set:{'quest.progress.hp':0}},cb2);
                        },
                        // party boss
                        function(arg1,arg2,cb2){
                          expect(user.items.gear.owned.weapon_special_2).to.not.be.ok();
                          Group.findByIdAndUpdate(group._id,{$set:{'quest.progress.hp':0}},cb2);
                        }
                      ],cb);
                    },
                    function(_group,cb){
                      request.post(baseURL+'/user/batch-update')
                      .send([
                        {op:'score',params:{direction:'up',id:user.dailys[1].id}},
                        {op:'update',body:{lastCron:moment().subtract('days',1)}} // set day to yesterday, cron will then be triggered on next action
                      ])
                      .end(function(){cb()})
                    },
                    function(cb){
                      request.post(baseURL+'/user/batch-update').end(function(res){cb(null,res.body)})
                    },
                    function(_user,cb){
                      // need to load the user again, since tavern boss does update after user's cron
                      User.findById(_user._id,cb);
                    },
                    function(_user,cb){
                      user = _user;
                      Group.findById(group._id,cb);
                    },
                    function(_group,cb){
                      var cummExp = shared.content.quests.vice3.drop.exp + shared.content.quests.dilatory.drop.exp;
                      var cummGp = shared.content.quests.vice3.drop.gp + shared.content.quests.dilatory.drop.gp;
                      ////FIXME check that user got exp, but user is leveling up making the exp check difficult
//                      expect(user.stats.exp).to.be.above(cummExp);
//                      expect(user.stats.gp).to.be.above(cummGp);
                      async.parallel([
                        // Tavern Boss
                        function(cb2){
                          Group.findById('habitrpg',function(err,tavern){
                            expect(_.isEmpty(tavern.quest)).to.be(true);
                            expect(user.items.pets['MantisShrimp-Base']).to.be(true);
                            expect(user.items.mounts['MantisShrimp-Base']).to.be(true);
                            expect(user.items.eggs.Dragon).to.be(2);
                            expect(user.items.hatchingPotions.Shade).to.be(2);
                            cb2();
                          })
                        },

                        // Party Boss
                        function(cb2){
                          expect(_.isEmpty(_group.quest)).to.be(true);
                          expect(user.items.gear.owned.weapon_special_2).to.be(true);
                          expect(user.items.eggs.Dragon).to.be(2);
                          expect(user.items.hatchingPotions.Shade).to.be(2);
                          expect(_.find(_group.members,{_id:party[0]._id}).items.gear.owned.weapon_special_2).to.be(true);
                          expect(_.find(_group.members,{_id:party[1]._id}).items.gear.owned.weapon_special_2).to.be(true);
                          expect(_.find(_group.members,{_id:party[2]._id}).items.gear.owned.weapon_special_2).to.not.be.ok();
                          cb2()
                        }

                      ],cb)
                    }
                  ],done);


                  // See all these })s? This is why CoffeeScript is better.
                  //})
                })
              })
            })
          })
        })
      });

    });

    describe.skip('Subscriptions', function(){
      var user;
      before(function(done){
        User.findOne({_id: _id}, function (err, _user) {
          expect(err).to.not.be.ok();
          user = _user;
          done();
        });
      })
    })

    it.skip('Handles unsubscription', function(done){
      var cron = function(){
        user.lastCron = moment().subtract('d',1);
        user.fns.cron();
      }
      expect(user.purchased.plan.customerId).to.not.be.ok();
      payments.createSubscription(user,{customerId:'123',paymentMethod:'Stripe'});
      expect(user.purchased.plan.customerId).to.be.ok();
      shared.wrap(user);
      cron();
      expect(user.purchased.plan.customerId).to.be.ok();
      payments.cancelSubscription(user);
      cron();
      expect(user.purchased.plan.customerId).to.be.ok();
      expect(user.purchased.plan.dateTerminated).to.be.ok();
      user.purchased.plan.dateTerminated = moment().subtract('d',2);
      cron();
      expect(user.purchased.plan.customerId).to.not.be.ok();
      payments.createSubscription(user,{customerId:'123',paymentMethod:'Stripe'});
      expect(user.purchased.plan.dateTerminated).to.not.be.ok();
      done();
    })


  });
});
