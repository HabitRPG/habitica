var Challenge, Group, app;

app = require("../../website/server/server");

Group = require("../../website/server/models/group").model;

Challenge = require("../../website/server/models/challenge").model;

describe("Challenges", function() {
  var challenge, group, updateTodo;
  challenge = void 0;
  updateTodo = void 0;
  group = void 0;
  beforeEach(function(done) {
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
        return request.post(baseURL + "/challenges").send({
          group: group._id,
          dailys: [
            {
              type: "daily",
              text: "Challenge Daily"
            }
          ],
          todos: [
            {
              type: "todo",
              text: "Challenge Todo 1",
              notes: "Challenge Notes"
            }
          ],
          rewards: [],
          habits: []
        }).end(function(err, res) {
          challenge = res.body;
          return done();
        });
      }
    ]);
  });
  describe('POST /challenge', function() {
    return it("Creates a challenge", function(done) {
      return request.post(baseURL + "/challenges").send({
        group: group._id,
        dailys: [
          {
            type: "daily",
            text: "Challenge Daily"
          }
        ],
        todos: [
          {
            type: "todo",
            text: "Challenge Todo 1",
            notes: "Challenge Notes"
          }, {
            type: "todo",
            text: "Challenge Todo 2",
            notes: "Challenge Notes"
          }
        ],
        rewards: [],
        habits: [],
        official: true
      }).end(function(err, res) {
        expectCode(res, 200);
        return async.parallel([
          function(cb) {
            return User.findById(user._id, cb);
          }, function(cb) {
            return Challenge.findById(res.body._id, cb);
          }
        ], function(err, results) {
          var user;
          user = results[0];
          challenge = results[1];
          expect(user.dailys[user.dailys.length - 1].text).to.equal("Challenge Daily");
          expect(challenge.official).to.equal(false);
          return done();
        });
      });
    });
  });
  describe('POST /challenge/:cid', function() {
    it("updates the notes on user's version of a challenge task's note without updating the challenge", function(done) {
      updateTodo = challenge.todos[0];
      updateTodo.notes = "User overriden notes";
      return async.waterfall([
        function(cb) {
          return request.put(baseURL + "/user/tasks/" + updateTodo.id).send(updateTodo).end(function(err, res) {
            return cb();
          });
        }, function(cb) {
          return Challenge.findById(challenge._id, cb);
        }, function(chal, cb) {
          expect(chal.todos[0].notes).to.eql("Challenge Notes");
          return cb();
        }, function(cb) {
          return request.get(baseURL + "/user/tasks/" + updateTodo.id).end(function(err, res) {
            expect(res.body.notes).to.eql("User overriden notes");
            return done();
          });
        }
      ]);
    });
    it("changes user's copy of challenge tasks when the challenge is updated", function(done) {
      challenge.dailys[0].text = "Updated Daily";
      return request.post(baseURL + "/challenges/" + challenge._id).send(challenge).end(function(err, res) {
        challenge = res.body;
        expect(challenge.dailys[0].text).to.equal("Updated Daily");
        return User.findById(user._id, function(err, _user) {
          expectCode(res, 200);
          expect(_user.dailys[_user.dailys.length - 1].text).to.equal("Updated Daily");
          return done();
        });
      });
    });
    it("does not changes user's notes on tasks when challenge task notes are updated", function(done) {
      challenge.todos[0].notes = "Challenge Updated Todo Notes";
      return request.post(baseURL + "/challenges/" + challenge._id).send(challenge).end(function(err, res) {
        challenge = res.body;
        expect(challenge.todos[0].notes).to.equal("Challenge Updated Todo Notes");
        return User.findById(user._id, function(err, _user) {
          expectCode(res, 200);
          expect(_user.todos[_user.todos.length - 1].notes).to.equal("Challenge Notes");
          return done();
        });
      });
    });
    return it("shows user notes on challenge page", function(done) {
      updateTodo = challenge.todos[0];
      updateTodo.notes = "User overriden notes";
      return async.waterfall([
        function(cb) {
          return request.put(baseURL + "/user/tasks/" + updateTodo.id).send(updateTodo).end(function(err, res) {
            return cb();
          });
        }, function(cb) {
          return Challenge.findById(challenge._id, cb);
        }, function(chal, cb) {
          expect(chal.todos[0].notes).to.eql("Challenge Notes");
          return cb();
        }, function(cb) {
          return request.get(baseURL + "/challenges/" + challenge._id + "/member/" + user._id).end(function(err, res) {
            expect(res.body.todos[res.body.todos.length - 1].notes).to.equal("User overriden notes");
            return done();
          });
        }
      ]);
    });
  });
  it("Complete To-Dos", function(done) {
    return User.findById(user._id, function(err, _user) {
      var numTasks, u;
      u = _user;
      numTasks = _.size(u.todos);
      return request.post(baseURL + "/user/tasks/" + u.todos[0].id + "/up").end(function(err, res) {
        return request.post(baseURL + "/user/tasks/clear-completed").end(function(err, res) {
          expect(_.size(res.body)).to.equal(numTasks - 1);
          return done();
        });
      });
    });
  });
  it("Challenge deleted, breaks task link", function(done) {
    var itThis;
    itThis = this;
    return request.del(baseURL + "/challenges/" + challenge._id).end(function(err, res) {
      return User.findById(user._id, function(err, user) {
        var daily, len, unset;
        len = user.dailys.length - 1;
        daily = user.dailys[user.dailys.length - 1];
        expect(daily.challenge.broken).to.equal("CHALLENGE_DELETED");
        unset = {
          $unset: {}
        };
        unset["$unset"]["dailys." + len + ".challenge.broken"] = 1;
        return User.findByIdAndUpdate(user._id, unset, {
          "new": true
        }, function(err, user) {
          expect(err).to.not.exist;
          expect(user.dailys[len].challenge.broken).to.not.exist;
          return request.post(baseURL + "/user/tasks/" + daily.id + "/up").end(function(err, res) {
            return setTimeout((function() {
              return User.findById(user._id, function(err, user) {
                expect(user.dailys[len].challenge.broken).to.equal("CHALLENGE_DELETED");
                return done();
              });
            }), 100);
          });
        });
      });
    });
  });
  it("admin creates a challenge", function(done) {
    return User.findByIdAndUpdate(user._id, {
      $set: {
        "contributor.admin": true
      }
    }, {
      "new": true
    }, function(err, _user) {
      expect(err).to.not.exist;
      return async.parallel([
        function(cb) {
          return request.post(baseURL + "/challenges").send({
            group: group._id,
            dailys: [],
            todos: [],
            rewards: [],
            habits: [],
            official: false
          }).end(function(err, res) {
            expect(res.body.official).to.equal(false);
            return cb();
          });
        }, function(cb) {
          return request.post(baseURL + "/challenges").send({
            group: group._id,
            dailys: [],
            todos: [],
            rewards: [],
            habits: [],
            official: true
          }).end(function(err, res) {
            expect(res.body.official).to.equal(true);
            return cb();
          });
        }
      ], done);
    });
  });
  it("User creates a non-tavern challenge with prize, deletes it, gets refund", function(done) {
    return User.findByIdAndUpdate(user._id, {
      $set: {
        "balance": 8
      }
    }, {
      "new": true
    }, function(err, user) {
      expect(err).to.not.be.ok;
      return request.post(baseURL + "/challenges").send({
        group: group._id,
        dailys: [],
        todos: [],
        rewards: [],
        habits: [],
        prize: 10
      }).end(function(err, res) {
        expect(res.body.prize).to.equal(10);
        return async.parallel([
          function(cb) {
            return User.findById(user._id, cb);
          }, function(cb) {
            return Challenge.findById(res.body._id, cb);
          }
        ], function(err, results) {
          user = results[0];
          challenge = results[1];
          expect(user.balance).to.equal(5.5);
          return request.del(baseURL + "/challenges/" + challenge._id).end(function(err, res) {
            return User.findById(user._id, function(err, _user) {
              expect(_user.balance).to.equal(8);
              return done();
            });
          });
        });
      });
    });
  });
  it("User creates a tavern challenge with prize, deletes it, and does not get refund", function(done) {
    return User.findByIdAndUpdate(user._id, {
      $set: {
        "balance": 8
      }
    }, {
      "new": true
    }, function(err, user) {
      expect(err).to.not.be.ok;
      return request.post(baseURL + "/challenges").send({
        group: 'habitrpg',
        dailys: [],
        todos: [],
        rewards: [],
        habits: [],
        prize: 10
      }).end(function(err, res) {
        expect(res.body.prize).to.equal(10);
        return async.parallel([
          function(cb) {
            return User.findById(user._id, cb);
          }, function(cb) {
            return Challenge.findById(res.body._id, cb);
          }
        ], function(err, results) {
          user = results[0];
          challenge = results[1];
          expect(user.balance).to.equal(5.5);
          return request.del(baseURL + "/challenges/" + challenge._id).end(function(err, res) {
            return User.findById(user._id, function(err, _user) {
              expect(_user.balance).to.equal(5.5);
              return done();
            });
          });
        });
      });
    });
  });
  return describe("non-owner permissions", function() {
    challenge = void 0;
    beforeEach(function(done) {
      return async.waterfall([
        function(cb) {
          return request.post(baseURL + "/challenges").send({
            group: group._id,
            name: 'challenge name',
            dailys: [
              {
                type: "daily",
                text: "Challenge Daily"
              }
            ]
          }).end(function(err, res) {
            challenge = res.body;
            return cb();
          });
        }, function(cb) {
          return registerNewUser(done, true);
        }
      ]);
    });
    context("non-owner", function() {
      it('can not edit challenge', function(done) {
        challenge.name = 'foobar';
        return request.post(baseURL + "/challenges/" + challenge._id).send(challenge).end(function(err, res) {
          var error;
          error = res.body.err;
          expect(error).to.eql("You don't have permissions to edit this challenge");
          return done();
        });
      });
      it('can not close challenge', function(done) {
        return request.post(baseURL + "/challenges/" + challenge._id + "/close?uid=" + user._id).end(function(err, res) {
          var error;
          error = res.body.err;
          expect(error).to.eql("You don't have permissions to close this challenge");
          return done();
        });
      });
      return it('can not delete challenge', function(done) {
        return request.del(baseURL + "/challenges/" + challenge._id).end(function(err, res) {
          var error;
          error = res.body.err;
          expect(error).to.eql("You don't have permissions to delete this challenge");
          return done();
        });
      });
    });
    return context("non-owner that is an admin", function() {
      beforeEach(function(done) {
        return User.findByIdAndUpdate(user._id, {
          'contributor.admin': true
        }, {
          "new": true
        }, done);
      });
      it('can edit challenge', function(done) {
        challenge.name = 'foobar';
        return request.post(baseURL + "/challenges/" + challenge._id).send(challenge).end(function(err, res) {
          expect(res.body.err).to.not.exist;
          return Challenge.findById(challenge._id, function(err, chal) {
            expect(chal.name).to.eql('foobar');
            return done();
          });
        });
      });
      it('can close challenge', function(done) {
        return request.post(baseURL + "/challenges/" + challenge._id + "/close?uid=" + user._id).end(function(err, res) {
          expect(res.body.err).to.not.exist;
          return User.findById(user._id, function(err, usr) {
            expect(usr.achievements.challenges[0]).to.eql(challenge.name);
            return done();
          });
        });
      });
      return it('can delete challenge', function(done) {
        return request.del(baseURL + "/challenges/" + challenge._id).end(function(err, res) {
          expect(res.body.err).to.not.exist;
          return request.get(baseURL + "/challenges/" + challenge._id).end(function(err, res) {
            var error;
            error = res.body.err;
            expect(error).to.eql("Challenge " + challenge._id + " not found");
            return done();
          });
        });
      });
    });
  });
});
