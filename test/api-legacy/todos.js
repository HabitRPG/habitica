require("../../website/src/server");

describe("Todos", function() {
  before(function(done) {
    return registerNewUser(done, true);
  });
  beforeEach(function(done) {
    return User.findById(user._id, function(err, _user) {
      var user;
      user = _user;
      shared.wrap(user);
      return done();
    });
  });
  return it("Archives old todos", function(done) {
    var numTasks;
    numTasks = _.size(user.todos);
    return request.post(baseURL + "/user/batch-update?_v=999").send([
      {
        op: "addTask",
        body: {
          type: "todo"
        }
      }, {
        op: "addTask",
        body: {
          type: "todo"
        }
      }, {
        op: "addTask",
        body: {
          type: "todo"
        }
      }
    ]).end(function(err, res) {
      expectCode(res, 200);
      expect(_.size(res.body.todos)).to.equal(numTasks + 3);
      numTasks += 3;
      return request.post(baseURL + "/user/batch-update?_v=998").send([
        {
          op: "score",
          params: {
            direction: "up",
            id: res.body.todos[0].id
          }
        }, {
          op: "score",
          params: {
            direction: "up",
            id: res.body.todos[1].id
          }
        }, {
          op: "score",
          params: {
            direction: "up",
            id: res.body.todos[2].id
          }
        }
      ]).end(function(err, res) {
        expectCode(res, 200);
        expect(_.size(res.body.todos)).to.equal(numTasks);
        return request.post(baseURL + "/user/batch-update?_v=997").send([
          {
            op: "updateTask",
            params: {
              id: res.body.todos[0].id
            },
            body: {
              dateCompleted: moment().subtract(4, "days")
            }
          }, {
            op: "updateTask",
            params: {
              id: res.body.todos[1].id
            },
            body: {
              dateCompleted: moment().subtract(4, "days")
            }
          }
        ]).end(function(err, res) {
          expect(_.size(res.body.todos)).to.equal(numTasks - 2);
          return done();
        });
      });
    });
  });
});
