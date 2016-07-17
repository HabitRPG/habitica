var Group, app, diff;

diff = require("deep-diff");

Group = require("../../website/server/models/group").model;

app = require("../../website/server/server");

describe("Party", function() {
  return context("Quests", function() {
    var group, notParticipating, participating, party;
    party = void 0;
    group = void 0;
    participating = [];
    notParticipating = [];
    beforeEach(function(done) {
      Group.update({
        _id: "habitrpg"
      }, {
        $set: {
          quest: {
            key: "dilatory",
            active: true,
            progress: {
              hp: shared.content.quests.dilatory.boss.hp,
              rage: 0
            }
          }
        }
      }).exec();
      return async.waterfall([
        function(cb) {
          return registerNewUser(cb, true);
        }, function(user, cb) {
          return request.post(baseURL + "/groups").send({
            name: "TestGroup",
            type: "party"
          }).end(function(err, res) {
            expectCode(res, 200);
            group = res.body;
            expect(group.members.length).to.equal(1);
            expect(group.leader).to.equal(user._id);
            return cb();
          });
        }, function(cb) {
          return request.post(baseURL + '/user/tasks').send({
            type: 'daily',
            text: 'daily one'
          }).end(function(err, res) {
            return cb();
          });
        }, function(cb) {
          return request.post(baseURL + '/user/tasks').send({
            type: 'daily',
            text: 'daily two'
          }).end(function(err, res) {
            return cb();
          });
        }, function(cb) {
          return User.findByIdAndUpdate(user._id, {
            $set: {
              "stats.lvl": 50
            }
          }, {
            "new": true
          }, function(err, _user) {
            return cb(null, _user);
          });
        }, function(_user, cb) {
          var user;
          user = _user;
          return request.post(baseURL + "/user/batch-update").send([
            {
              op: "score",
              params: {
                direction: "up",
                id: user.dailys[0].id
              }
            }, {
              op: "score",
              params: {
                direction: "up",
                id: user.dailys[0].id
              }
            }, {
              op: "update",
              body: {
                "stats.lvl": 50
              }
            }
          ]).end(function(err, res) {
            user = res.body;
            expect(user.party.quest.progress.up).to.be.above(0);
            return async.waterfall([
              function(cb) {
                return registerManyUsers(3, cb);
              }, function(_party, cb) {
                var inviteURL;
                party = _party;
                inviteURL = baseURL + "/groups/" + group._id + "/invite";
                return async.parallel([
                  function(cb2) {
                    return request.post(inviteURL).send({
                      uuids: [party[0]._id]
                    }).end(function() {
                      return cb2();
                    });
                  }, function(cb2) {
                    return request.post(inviteURL).send({
                      uuids: [party[1]._id]
                    }).end(function() {
                      return cb2();
                    });
                  }, function(cb2) {
                    return request.post(inviteURL).send({
                      uuids: [party[2]._id]
                    }).end(function(err, res) {
                      return cb2();
                    });
                  }
                ], cb);
              }, function(results, cb) {
                var series;
                series = _.reduce(party, function(m, v, i) {
                  m.push(function(cb2) {
                    return request.post(baseURL + "/groups/" + group._id + "/join").set("X-API-User", party[i]._id).set("X-API-Key", party[i].apiToken).end(function() {
                      return cb2();
                    });
                  });
                  return m;
                }, []);
                return async.series(series, cb);
              }, function(whatever, cb) {
                return Group.findById(group._id, function(err, g) {
                  group = g;
                  expect(g.members.length).to.equal(4);
                  return cb();
                });
              }
            ], function() {
              return async.waterfall([
                function(cb) {
                  return request.post(baseURL + "/groups/" + group._id + "/questAccept?key=vice3").end(function(err, res) {
                    expectCode(res, 400);
                    return User.findByIdAndUpdate(user._id, {
                      $set: {
                        "items.quests.vice3": 1
                      }
                    }, {
                      "new": true
                    }, cb);
                  });
                }, function(_user, cb) {
                  return request.post(baseURL + "/groups/" + group._id + "/questAccept?key=vice3").end(function(err, res) {
                    expectCode(res, 200);
                    return Group.findById(group._id, cb);
                  });
                }, function(_group, cb) {
                  expect(_group.quest.key).to.equal("vice3");
                  expect(_group.quest.active).to.equal(false);
                  return request.post(baseURL + "/groups/" + group._id + "/questAccept").set("X-API-User", party[0]._id).set("X-API-Key", party[0].apiToken).end(function() {
                    return request.post(baseURL + "/groups/" + group._id + "/questAccept").set("X-API-User", party[1]._id).set("X-API-Key", party[1].apiToken).end(function(err, res) {
                      return request.post(baseURL + "/groups/" + group._id + "/questReject").set("X-API-User", party[2]._id).set("X-API-Key", party[2].apiToken).end(function(err, res) {
                        group = res.body;
                        expect(group.quest.active).to.equal(true);
                        return cb();
                      });
                    });
                  });
                }
              ], done);
            });
          });
        }
      ]);
    });
    it("Casts a spell", function(done) {
      var mp;
      mp = user.stats.mp;
      return request.get(baseURL + "/members/" + party[0]._id).end(function(err, res) {
        party[0] = res.body;
        return request.post(baseURL + "/user/class/cast/snowball?targetType=user&targetId=" + party[0]._id).end(function(err, res) {
          return request.get(baseURL + "/members/" + party[0]._id).end(function(err, res) {
            var difference, member;
            member = res.body;
            expect(member.achievements.snowball).to.equal(1);
            expect(member.stats.buffs.snowball).to.exist;
            difference = diff(member, party[0]);
            expect(_.size(difference)).to.equal(2);
            return request.put(baseURL + "/user").send({
              "stats.lvl": 5
            }).end(function(err, res) {
              return request.put(baseURL + "/user").send({
                "stats.mp": 100
              }).end(function(err, res) {
                return request.post(baseURL + "/user/class/cast/valorousPresence?targetType=party").end(function(err, res) {
                  return request.get(baseURL + "/members/" + member._id).end(function(err, res) {
                    expect(res.body.stats.buffs.str).to.be.above(0);
                    expect(diff(res.body, member).length).to.equal(1);
                    return done();
                  });
                });
              });
            });
          });
        });
      });
    });
    it("Doesn't include people who aren't participating", function(done) {
      return request.get(baseURL + "/groups/" + group._id).end(function(err, res) {
        expect(_.size(res.body.quest.members)).to.equal(3);
        return done();
      });
    });
    it("allows quest participants to leave quest", function(done) {
      var leavingMember;
      leavingMember = party[1];
      expect(group.quest.members[leavingMember._id]).to.eql(true);
      return request.post(baseURL + "/groups/" + group._id + "/questLeave").set("X-API-User", leavingMember._id).set("X-API-Key", leavingMember.apiToken).end(function(err, res) {
        expectCode(res, 204);
        return request.get(baseURL + '/groups/party').end(function(err, res) {
          expect(res.body.quest.members[leavingMember._id]).to.not.be.ok;
          return done();
        });
      });
    });
    return xit("Hurts the boss", function(done) {
      return request.post(baseURL + "/user/batch-update").end(function(err, res) {
        var up, user;
        user = res.body;
        up = user.party.quest.progress.up;
        expect(up).to.be.above(0);
        return request.post(baseURL + "/user/batch-update").send([
          {
            op: "score",
            params: {
              direction: "up",
              id: user.dailys[0].id
            }
          }, {
            op: "update",
            body: {
              lastCron: moment().subtract(1, "days")
            }
          }
        ]).end(function(err, res) {
          expect(res.body.party.quest.progress.up).to.be.above(up);
          return request.post(baseURL + "/user/batch-update").end(function() {
            return request.get(baseURL + "/groups/party").end(function(err, res) {
              return async.waterfall([
                function(cb) {
                  return async.parallel([
                    function(cb2) {
                      return Group.findById("habitrpg", {
                        quest: 1
                      }, function(err, tavern) {
                        expect(tavern.quest.progress.hp).to.be.below(shared.content.quests.dilatory.boss.hp);
                        expect(tavern.quest.progress.rage).to.be.above(0);
                        return cb2();
                      });
                    }, function(cb2) {
                      var _party;
                      expect(res.body.quest.progress.hp).to.be.below(shared.content.quests.vice3.boss.hp);
                      _party = res.body.members;
                      expect(_.find(_party, {
                        _id: party[0]._id
                      }).stats.hp).to.be.below(50);
                      expect(_.find(_party, {
                        _id: party[1]._id
                      }).stats.hp).to.be.below(50);
                      expect(_.find(_party, {
                        _id: party[2]._id
                      }).stats.hp).to.be(50);
                      return cb2();
                    }
                  ], cb);
                }, function(whatever, cb) {
                  return async.waterfall([
                    function(cb2) {
                      expect(user.items.pets["MantisShrimp-Base"]).to.not.be.ok();
                      return Group.update({
                        _id: "habitrpg"
                      }, {
                        $set: {
                          "quest.progress.hp": 0
                        }
                      }, cb2);
                    }, function(arg1, arg2, cb2) {
                      expect(user.items.gear.owned.weapon_special_2).to.not.be.ok();
                      return Group.findByIdAndUpdate(group._id, {
                        $set: {
                          "quest.progress.hp": 0
                        }
                      }, {
                        "new": true
                      }, cb2);
                    }
                  ], cb);
                }, function(_group, cb) {
                  return request.post(baseURL + "/user/batch-update").send([
                    {
                      op: "score",
                      params: {
                        direction: "up",
                        id: user.dailys[1].id
                      }
                    }, {
                      op: "update",
                      body: {
                        lastCron: moment().subtract(1, "days")
                      }
                    }
                  ]).end(function() {
                    return cb();
                  });
                }, function(cb) {
                  return request.post(baseURL + "/user/batch-update").end(function(err, res) {
                    return cb(null, res.body);
                  });
                }, function(_user, cb) {
                  return User.findById(_user._id, cb);
                }, function(_user, cb) {
                  user = _user;
                  return Group.findById(group._id, cb);
                }, function(_group, cb) {
                  var cummExp, cummGp;
                  cummExp = shared.content.quests.vice3.drop.exp + shared.content.quests.dilatory.drop.exp;
                  cummGp = shared.content.quests.vice3.drop.gp + shared.content.quests.dilatory.drop.gp;
                  return async.parallel([
                    function(cb2) {
                      return Group.findById("habitrpg", function(err, tavern) {
                        expect(_.isEmpty(tavern.get("quest"))).to.equal(true);
                        expect(user.items.pets["MantisShrimp-Base"]).to.equal(5);
                        expect(user.items.mounts["MantisShrimp-Base"]).to.equal(true);
                        expect(user.items.eggs.Dragon).to.equal(2);
                        expect(user.items.hatchingPotions.Shade).to.equal(2);
                        return cb2();
                      });
                    }, function(cb2) {
                      expect(_.isEmpty(_group.get("quest"))).to.equal(true);
                      expect(user.items.gear.owned.weapon_special_2).to.equal(true);
                      expect(user.items.eggs.Dragon).to.equal(2);
                      expect(user.items.hatchingPotions.Shade).to.equal(2);
                      return async.parallel([
                        function(cb3) {
                          return User.findById(party[0].id, function(err, mbr) {
                            expect(mbr.items.gear.owned.weapon_special_2).to.equal(true);
                            return cb3();
                          });
                        }, function(cb3) {
                          return User.findById(party[1].id, function(err, mbr) {
                            expect(mbr.items.gear.owned.weapon_special_2).to.equal(true);
                            return cb3();
                          });
                        }, function(cb3) {
                          return User.findById(party[2].id, function(err, mbr) {
                            expect(mbr.items.gear.owned.weapon_special_2).to.not.be.ok();
                            return cb3();
                          });
                        }
                      ], cb2);
                    }
                  ], cb);
                }
              ], done);
            });
          });
        });
      });
    });
  });
});
