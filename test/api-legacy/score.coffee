'use strict'

require("../../website/src/server")

describe "Score", ->
  before (done) ->
    registerNewUser done, true

  context "Todos that did not previously exist", ->
    it "creates a completed a todo when using up url", (done) ->
      request.post(baseURL + "/user/tasks/withUp/up").send(
        type: "todo"
        text: "withUp"
      ).end (err, res) ->
        expectCode res, 200
        request.get(baseURL + "/user/tasks/withUp").end (err, res) ->
          upTodo = res.body
          expect(upTodo.completed).to.equal true
        done()

    it "creates an uncompleted todo when using down url", (done) ->
      request.post(baseURL + "/user/tasks/withDown/down").send(
        type: "todo"
        text: "withDown"
      ).end (err, res) ->
        expectCode res, 200
        request.get(baseURL + "/user/tasks/withDown").end (err, res) ->
          downTodo = res.body
          expect(downTodo.completed).to.equal false
          done()

    it "creates a completed a todo overriding the complete parameter when using up url", (done) ->
      request.post(baseURL + "/user/tasks/withUpWithComplete/up").send(
        type: "todo"
        text: "withUpWithComplete"
        completed: false
      ).end (err, res) ->
        expectCode res, 200
        request.get(baseURL + "/user/tasks/withUpWithComplete").end (err, res) ->
          upTodo = res.body
          expect(upTodo.completed).to.equal true
          done()

    it "Creates an uncompleted todo overriding the completed parameter when using down url", (done) ->
      request.post(baseURL + "/user/tasks/withDownWithUncomplete/down").send(
        type: "todo"
        text: "withDownWithUncomplete"
        completed: true
      ).end (err, res) ->
        expectCode res, 200
        request.get(baseURL + "/user/tasks/withDownWithUncomplete").end (err, res) ->
          downTodo = res.body
          expect(downTodo.completed).to.equal false
          done()

  context "Todo that already exists", ->
    it "It completes a todo when using up url", (done) ->
      request.post(baseURL + "/user/tasks").send(
        type: "todo"
        text: "Sample Todo"
      ).end (err, res) ->
        expectCode res, 200
        unCompletedTodo = res.body
        console.log('unCompletedTodo', res.body._id);
        expect(unCompletedTodo.completed).to.equal false
        request.post(baseURL + "/user/tasks/"+unCompletedTodo._id+"/up").end (err, res) ->
          expectCode res, 200
          request.get(baseURL + "/user/tasks/"+unCompletedTodo._id).end (err, res) ->
            unCompletedTodo = res.body
            expect(unCompletedTodo.completed).to.equal true
            done()

    it "It uncompletes a todo when using down url", (done) ->
      request.post(baseURL + "/user/tasks").send(
        type: "todo"
        text: "Sample Todo"
        completed: true
      ).end (err, res) ->
        expectCode res, 200
        completedTodo = res.body
        expect(completedTodo.completed).to.equal true
        request.post(baseURL + "/user/tasks/"+completedTodo._id+"/down").end (err, res) ->
          expectCode res, 200
          request.get(baseURL + "/user/tasks/"+completedTodo._id).end (err, res) ->
            completedTodo = res.body
            expect(completedTodo.completed).to.equal false
            done()

  it "Creates and scores up a habit when using up url", (done) ->
    upHabit = undefined
    request.post(baseURL + "/user/tasks/habitWithUp/up").send(
      type: "habit"
      text: "testTitle"
      completed: true
    ).end (err, res) ->
      expectCode res, 200
      request.get(baseURL + "/user/tasks/habitWithUp").end (err, res) ->
        upHabit = res.body
        expect(upHabit.value).to.be.at.least(1)
        expect(upHabit.type).to.equal("habit")
        done()

  it "Creates and scores down a habit when using down url", (done) ->
    downHabit = undefined
    request.post(baseURL + "/user/tasks/habitWithDown/down").send(
      type: "habit"
      text: "testTitle"
      completed: true
    ).end (err, res) ->
      expectCode res, 200
      request.get(baseURL + "/user/tasks/habitWithDown").end (err, res) ->
        downHabit = res.body
        expect(downHabit.value).to.have.at.most(-1)
        expect(downHabit.type).to.equal("habit")
        done()
