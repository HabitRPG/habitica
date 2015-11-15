require("../../website/src/server");

describe("Score", function() {
  before(function(done) {
    return registerNewUser(done, true);
  });
  context("Todos that did not previously exist", function() {
    it("creates a completed a todo when using up url", function(done) {
      return request.post(baseURL + "/user/tasks/withUp/up").send({
        type: "todo",
        text: "withUp"
      }).end(function(err, res) {
        expectCode(res, 200);
        request.get(baseURL + "/user/tasks/withUp").end(function(err, res) {
          var upTodo;
          upTodo = res.body;
          return expect(upTodo.completed).to.equal(true);
        });
        return done();
      });
    });
    it("creates an uncompleted todo when using down url", function(done) {
      return request.post(baseURL + "/user/tasks/withDown/down").send({
        type: "todo",
        text: "withDown"
      }).end(function(err, res) {
        expectCode(res, 200);
        return request.get(baseURL + "/user/tasks/withDown").end(function(err, res) {
          var downTodo;
          downTodo = res.body;
          expect(downTodo.completed).to.equal(false);
          return done();
        });
      });
    });
    it("creates a completed a todo overriding the complete parameter when using up url", function(done) {
      return request.post(baseURL + "/user/tasks/withUpWithComplete/up").send({
        type: "todo",
        text: "withUpWithComplete",
        completed: false
      }).end(function(err, res) {
        expectCode(res, 200);
        return request.get(baseURL + "/user/tasks/withUpWithComplete").end(function(err, res) {
          var upTodo;
          upTodo = res.body;
          expect(upTodo.completed).to.equal(true);
          return done();
        });
      });
    });
    return it("Creates an uncompleted todo overriding the completed parameter when using down url", function(done) {
      return request.post(baseURL + "/user/tasks/withDownWithUncomplete/down").send({
        type: "todo",
        text: "withDownWithUncomplete",
        completed: true
      }).end(function(err, res) {
        expectCode(res, 200);
        return request.get(baseURL + "/user/tasks/withDownWithUncomplete").end(function(err, res) {
          var downTodo;
          downTodo = res.body;
          expect(downTodo.completed).to.equal(false);
          return done();
        });
      });
    });
  });
  context("Todo that already exists", function() {
    it("It completes a todo when using up url", function(done) {
      return request.post(baseURL + "/user/tasks").send({
        type: "todo",
        text: "Sample Todo"
      }).end(function(err, res) {
        var unCompletedTodo;
        expectCode(res, 200);
        unCompletedTodo = res.body;
        expect(unCompletedTodo.completed).to.equal(false);
        return request.post(baseURL + "/user/tasks/" + unCompletedTodo._id + "/up").end(function(err, res) {
          expectCode(res, 200);
          return request.get(baseURL + "/user/tasks/" + unCompletedTodo._id).end(function(err, res) {
            unCompletedTodo = res.body;
            expect(unCompletedTodo.completed).to.equal(true);
            return done();
          });
        });
      });
    });
    return it("It uncompletes a todo when using down url", function(done) {
      return request.post(baseURL + "/user/tasks").send({
        type: "todo",
        text: "Sample Todo",
        completed: true
      }).end(function(err, res) {
        var completedTodo;
        expectCode(res, 200);
        completedTodo = res.body;
        expect(completedTodo.completed).to.equal(true);
        return request.post(baseURL + "/user/tasks/" + completedTodo._id + "/down").end(function(err, res) {
          expectCode(res, 200);
          return request.get(baseURL + "/user/tasks/" + completedTodo._id).end(function(err, res) {
            completedTodo = res.body;
            expect(completedTodo.completed).to.equal(false);
            return done();
          });
        });
      });
    });
  });
  it("Creates and scores up a habit when using up url", function(done) {
    var upHabit;
    upHabit = void 0;
    return request.post(baseURL + "/user/tasks/habitWithUp/up").send({
      type: "habit",
      text: "testTitle",
      completed: true
    }).end(function(err, res) {
      expectCode(res, 200);
      return request.get(baseURL + "/user/tasks/habitWithUp").end(function(err, res) {
        upHabit = res.body;
        expect(upHabit.value).to.be.at.least(1);
        expect(upHabit.type).to.equal("habit");
        return done();
      });
    });
  });
  return it("Creates and scores down a habit when using down url", function(done) {
    var downHabit;
    downHabit = void 0;
    return request.post(baseURL + "/user/tasks/habitWithDown/down").send({
      type: "habit",
      text: "testTitle",
      completed: true
    }).end(function(err, res) {
      expectCode(res, 200);
      return request.get(baseURL + "/user/tasks/habitWithDown").end(function(err, res) {
        downHabit = res.body;
        expect(downHabit.value).to.have.at.most(-1);
        expect(downHabit.type).to.equal("habit");
        return done();
      });
    });
  });
});
