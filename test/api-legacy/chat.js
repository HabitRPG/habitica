var Group, app, diff;

diff = require("deep-diff");

Group = require("../../website/src/models/group").model;

app = require("../../website/src/server");

describe("Chat", function() {
  var chat, group;
  group = void 0;
  before(function(done) {
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
      }
    ], done);
  });
  chat = void 0;
  return it("removes a user's chat notifications when user is kicked", function(done) {
    var userToRemove;
    userToRemove = null;
    return async.waterfall([
      function(cb) {
        return registerManyUsers(1, cb);
      }, function(members, cb) {
        userToRemove = members[0];
        return request.post(baseURL + "/groups/" + group._id + "/invite").send({
          uuids: [userToRemove._id]
        }).end(function() {
          return cb();
        });
      }, function(cb) {
        return request.post(baseURL + "/groups/" + group._id + "/join").set("X-API-User", userToRemove._id).set("X-API-Key", userToRemove.apiToken).end(function(err, res) {
          return cb();
        });
      }, function(cb) {
        var msg;
        msg = "TestMsg";
        return request.post(baseURL + "/groups/" + group._id + "/chat?message=" + msg).end(function(err, res) {
          return cb();
        });
      }, function(cb) {
        return request.get(baseURL + "/user").set("X-API-User", userToRemove._id).set("X-API-Key", userToRemove.apiToken).end(function(err, res) {
          expect(res.body.newMessages[group._id]).to.exist;
          return cb();
        });
      }, function(cb) {
        return request.post(baseURL + "/groups/" + group._id + "/removeMember?uuid=" + userToRemove._id).end(function(err, res) {
          return cb();
        });
      }, function(cb) {
        return request.get(baseURL + "/user").set("X-API-User", userToRemove._id).set("X-API-Key", userToRemove.apiToken).end(function(err, res) {
          expect(res.body.newMessages[group._id]).to.not.exist;
          return cb();
        });
      }
    ], done);
  });
});
