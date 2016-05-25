var app, rewire, sinon;

app = require("../../website/server/server");

rewire = require('rewire');

sinon = require('sinon');

describe("Push-Notifications", function() {
  before(function(done) {
    return registerNewUser(done, true);
  });
  return describe("Events that send push notifications", function() {
    var pushSpy;
    pushSpy = {
      sendNotify: sinon.spy()
    };
    afterEach(function(done) {
      pushSpy.sendNotify.reset();
      return done();
    });
    context("Challenges", function() {
      var challengeMock, challenges, userMock;
      challenges = rewire("../../website/server/controllers/api-v2/challenges");
      challenges.__set__('pushNotify', pushSpy);
      challengeMock = {
        findById: function(arg, cb) {
          return cb(null, {
            leader: user._id,
            name: 'challenge-name'
          });
        }
      };
      userMock = {
        findById: function(arg, cb) {
          return cb(null, user);
        }
      };
      challenges.__set__('Challenge', challengeMock);
      challenges.__set__('User', userMock);
      challenges.__set__('closeChal', function() {
        return true;
      });
      beforeEach(function(done) {
        return registerNewUser(function() {
          user.preferences.emailNotifications.wonChallenge = false;
          user.save = function(cb) {
            return cb(null, user);
          };
          return done();
        }, true);
      });
      return it("sends a push notification when you win a challenge", function(done) {
        var req, res;
        req = {
          params: {
            cid: 'challenge-id'
          },
          query: {
            uid: 'user-id'
          }
        };
        res = {
          locals: {
            user: user
          }
        };
        challenges.selectWinner(req, res);
        return setTimeout(function() {
          expect(pushSpy.sendNotify).to.have.been.calledOnce;
          expect(pushSpy.sendNotify).to.have.been.calledWith(user, 'You won a Challenge!', 'challenge-name');
          return done();
        }, 100);
      });
    });
    context("Groups", function() {
      var groups, recipient;
      recipient = null;
      groups = rewire("../../website/server/controllers/api-v2/groups");
      groups.__set__('pushNotify', pushSpy);
      before(function(done) {
        return registerNewUser(function(err, _user) {
          var userMock;
          recipient = _user;
          recipient.invitations.guilds = [];
          recipient.save = function(cb) {
            return cb(null, recipient);
          };
          recipient.preferences.emailNotifications.invitedGuild = false;
          recipient.preferences.emailNotifications.invitedParty = false;
          recipient.preferences.emailNotifications.invitedQuest = false;
          userMock = {
            findById: function(arg, cb) {
              return cb(null, recipient);
            },
            find: function(arg, arg2, cb) {
              return cb(null, [recipient]);
            },
            update: function(arg, arg2) {
              return {
                exec: function() {
                  return true;
                }
              };
            }
          };
          groups.__set__('User', userMock);
          return done();
        }, false);
      });
      it("sends a push notification when invited to a guild", function(done) {
        var group, req, res;
        group = {
          _id: 'guild-id',
          name: 'guild-name',
          type: 'guild',
          members: [user._id],
          invites: []
        };
        group.save = function(cb) {
          return cb(null, group);
        };
        req = {
          body: {
            uuids: [recipient._id]
          }
        };
        res = {
          locals: {
            group: group,
            user: user
          },
          json: function() {
            return true;
          }
        };
        groups.invite(req, res);
        return setTimeout(function() {
          expect(pushSpy.sendNotify).to.have.been.calledOnce;
          expect(pushSpy.sendNotify).to.have.been.calledWith(recipient, 'Invited To Guild', group.name);
          return done();
        }, 100);
      });
      it("sends a push notification when invited to a party", function(done) {
        var group, req, res;
        group = {
          _id: 'party-id',
          name: 'party-name',
          type: 'party',
          members: [user._id],
          invites: []
        };
        group.save = function(cb) {
          return cb(null, group);
        };
        req = {
          body: {
            uuids: [recipient._id]
          }
        };
        res = {
          locals: {
            group: group,
            user: user
          },
          json: function() {
            return true;
          }
        };
        groups.invite(req, res);
        return setTimeout(function() {
          expect(pushSpy.sendNotify).to.have.been.calledOnce;
          expect(pushSpy.sendNotify).to.have.been.calledWith(recipient, 'Invited To Party', group.name);
          return done();
        }, 100);
      });
      it("sends a push notification when invited to a quest", function(done) {
        var group, req, res;
        group = {
          _id: 'party-id',
          name: 'party-name',
          type: 'party',
          members: [user._id, recipient._id],
          invites: [],
          quest: {}
        };
        user.items.quests.hedgehog = 5;
        group.save = function(cb) {
          return cb(null, group);
        };
        group.markModified = function() {
          return true;
        };
        req = {
          body: {
            uuids: [recipient._id]
          },
          query: {
            key: 'hedgehog'
          }
        };
        res = {
          locals: {
            group: group,
            user: user
          },
          json: function() {
            return true;
          }
        };
        groups.questAccept(req, res);
        return setTimeout(function() {
          expect(pushSpy.sendNotify).to.have.been.calledOnce;
          expect(pushSpy.sendNotify).to.have.been.calledWith(recipient, 'Quest Invitation', 'Invitation for the Quest The Hedgebeast');
          return done();
        }, 100);
      });
      return it("sends a push notification to participating members when quest starts", function(done) {
        var group, req, res, userMock;
        group = {
          _id: 'party-id',
          name: 'party-name',
          type: 'party',
          members: [user._id, recipient._id],
          invites: []
        };
        group.quest = {
          key: 'hedgehog',
          progress: {
            hp: 100
          },
          members: {}
        };
        group.quest.members[recipient._id] = true;
        group.save = function(cb) {
          return cb(null, group);
        };
        group.markModified = function() {
          return true;
        };
        req = {
          body: {
            uuids: [recipient._id]
          },
          query: {}
        };
        res = {
          locals: {
            group: group,
            user: user
          },
          json: function() {
            return true;
          }
        };
        userMock = {
          findOne: function(arg, arg2, cb) {
            return cb(null, recipient);
          },
          update: function(arg, arg2, cb) {
            if (cb) {
              return cb(null, user);
            } else {
              return {
                exec: function() {
                  return true;
                }
              };
            }
          }
        };
        groups.__set__('User', userMock);
        groups.__set__('populateQuery', function(arg, arg2, arg3) {
          return {
            exec: function() {
              return group.members;
            }
          };
        });
        groups.questAccept(req, res);
        return setTimeout(function() {
          expect(pushSpy.sendNotify).to.have.been.calledTwice;
          expect(pushSpy.sendNotify).to.have.been.calledWith(recipient, 'HabitRPG', 'Your Quest has Begun: The Hedgebeast');
          return done();
        }, 100);
      });
    });
    return describe("Gifts", function() {
      var recipient;
      recipient = null;
      before(function(done) {
        return registerNewUser(function(err, _user) {
          recipient = _user;
          recipient.preferences.emailNotifications.giftedGems = false;
          user.balance = 4;
          user.save = function() {
            return true;
          };
          recipient.save = function() {
            return true;
          };
          return done();
        }, false);
      });
      context("sending gems from balance", function() {
        var members;
        members = rewire("../../website/server/controllers/api-v2/members");
        members.sendMessage = function() {
          return true;
        };
        members.__set__('pushNotify', pushSpy);
        members.__set__('fetchMember', function(id) {
          return function(cb) {
            return cb(null, recipient);
          };
        });
        return it("sends a push notification", function(done) {
          var req, res;
          req = {
            params: {
              uuid: "uuid"
            },
            body: {
              type: 'gems',
              gems: {
                amount: 1
              }
            }
          };
          res = {
            locals: {
              user: user
            }
          };
          members.sendGift(req, res);
          return setTimeout(function() {
            expect(pushSpy.sendNotify).to.have.been.calledOnce;
            expect(pushSpy.sendNotify).to.have.been.calledWith(recipient, 'Gifted Gems', '1 Gems - by ' + user.profile.name);
            return done();
          }, 100);
        });
      });
      return describe("Purchases", function() {
        var membersMock, payments;
        payments = rewire("../../website/server/controllers/payments");
        payments.__set__('pushNotify', pushSpy);
        membersMock = {
          sendMessage: function() {
            return true;
          }
        };
        payments.__set__('members', membersMock);
        context("buying gems as a purchased gift", function() {
          it("sends a push notification", function(done) {
            var data;
            data = {
              user: user,
              gift: {
                member: recipient,
                gems: {
                  amount: 1
                }
              }
            };
            payments.buyGems(data);
            return setTimeout(function() {
              expect(pushSpy.sendNotify).to.have.been.calledOnce;
              expect(pushSpy.sendNotify).to.have.been.calledWith(recipient, 'Gifted Gems', '1 Gems - by ' + user.profile.name);
              return done();
            }, 100);
          });
          return it("does not send a push notification if buying gems for self", function(done) {
            var data;
            data = {
              user: user,
              gift: {
                member: user,
                gems: {
                  amount: 1
                }
              }
            };
            payments.buyGems(data);
            return setTimeout(function() {
              expect(pushSpy.sendNotify).to.not.have.been.called;
              return done();
            }, 100);
          });
        });
        return context("sending a subscription as a purchased gift", function() {
          it("sends a push notification", function(done) {
            var data;
            data = {
              user: user,
              gift: {
                member: recipient,
                subscription: {
                  key: 'basic_6mo'
                }
              }
            };
            payments.createSubscription(data);
            return setTimeout(function() {
              expect(pushSpy.sendNotify).to.have.been.calledOnce;
              expect(pushSpy.sendNotify).to.have.been.calledWith(recipient, 'Gifted Subscription', '6 months - by ' + user.profile.name);
              return done();
            }, 100);
          });
          return it("does not send a push notification if buying subscription for self", function(done) {
            var data;
            data = {
              user: user,
              gift: {
                member: user,
                subscription: {
                  key: 'basic_6mo'
                }
              }
            };
            payments.createSubscription(data);
            return setTimeout(function() {
              expect(pushSpy.sendNotify).to.not.have.been.called;
              return done();
            }, 100);
          });
        });
      });
    });
  });
});
