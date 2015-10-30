'use strict'

require("../../website/src/server")

describe "Todos", ->

  before (done) ->
    registerNewUser done, true

  beforeEach (done) ->
    User.findById user._id, (err, _user) ->
      user = _user
      shared.wrap user
      done()

  it "Archives old todos", (done) ->
    numTasks = _.size(user.todos)
    request.post(baseURL + "/user/batch-update?_v=999").send([
      {
        op: "addTask"
        body:
          type: "todo"
      }
      {
        op: "addTask"
        body:
          type: "todo"
      }
      {
        op: "addTask"
        body:
          type: "todo"
      }
    ]).end (err, res) ->
      expectCode res, 200
      # Expect number of todos to be 3 greater than the number the user started with
      expect(_.size(res.body.todos)).to.equal numTasks + 3
      # Assign new number to numTasks variable
      numTasks += 3
      request.post(baseURL + "/user/batch-update?_v=998").send([
        {
          op: "score"
          params:
            direction: "up"
            id: res.body.todos[0].id
        }
        {
          op: "score"
          params:
            direction: "up"
            id: res.body.todos[1].id
        }
        {
          op: "score"
          params:
            direction: "up"
            id: res.body.todos[2].id
        }
      ]).end (err, res) ->
        expectCode res, 200
        expect(_.size(res.body.todos)).to.equal numTasks
        request.post(baseURL + "/user/batch-update?_v=997").send([
          {
            op: "updateTask"
            params:
              id: res.body.todos[0].id

            body:
              dateCompleted: moment().subtract(4, "days")
          }
          {
            op: "updateTask"
            params:
              id: res.body.todos[1].id

            body:
              dateCompleted: moment().subtract(4, "days")
          }
        ]).end (err, res) ->
          # Expect todos to be 2 less than the total count
          expect(_.size(res.body.todos)).to.equal numTasks - 2
          done()
