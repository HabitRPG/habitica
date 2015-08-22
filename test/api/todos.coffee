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
    ]).end (res) ->
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
      ]).end (res) ->
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
        ]).end (res) ->
          # Expect todos to be 2 less than the total count
          expect(_.size(res.body.todos)).to.equal numTasks - 2
          done()

  describe "Creating, Updating, Deleting Todos", ->
    todo = undefined
    updateTodo = undefined
    describe "Creating todos", ->
      it "Creates a todo", (done) ->
        request.post(baseURL + "/user/tasks").send(
            type: "todo"
            text: "Sample Todo"
        ).end (res) ->
          expectCode res, 200
          todo = res.body
          expect(todo.text).to.equal "Sample Todo"
          expect(todo.id).to.be.ok
          expect(todo.value).to.equal 0
          done()

      it "Does not create a todo with an id that already exists", (done) ->
        original_todo = {
          type: "todo"
          text: "original todo"
          id: "custom-id"
        }
        duplicate_id_todo = {
          type: "todo"
          text: "not original todo"
          id: "custom-id"
        }
        request.post(baseURL + "/user/tasks").send(
          original_todo
        ).end (res) ->
          request.post(baseURL + "/user/tasks").send(
            duplicate_id_todo
          ).end (res) ->
            expectCode res, 409
            expect(res.body.err).to.eql('A task with that ID already exists.')
            done()

    describe "Updating todos", ->
      it "Does not update id of todo", (done) ->
        request.put(baseURL + "/user/tasks/" + todo.id).send(
          id: "a-new-id"
        ).end (res) ->
          expectCode res, 200
          updateTodo = res.body
          expect(updateTodo.id).to.equal todo.id
          done()

      it "Does not update type of todo", (done) ->
        request.put(baseURL + "/user/tasks/" + todo.id).send(
          type: "habit"
        ).end (res) ->
          expectCode res, 200
          updateTodo = res.body
          expect(updateTodo.type).to.equal todo.type
          done()

      it "Does update text, attribute, priority, value, notes", (done) ->
        request.put(baseURL + "/user/tasks/" + todo.id).send(
          text: "Changed Title"
          attribute: "int"
          priority: 1.5
          value: 5
          notes: "Some notes"
        ).end (res) ->
          expectCode res, 200
          todo = res.body
          expect(todo.text).to.equal "Changed Title"
          expect(todo.attribute).to.equal "int"
          expect(todo.priority).to.equal 1.5
          expect(todo.value).to.equal 5
          expect(todo.notes).to.equal "Some notes"
          done()

    describe "Deleting todos", ->
      it "Does delete todo", (done) ->
        request.del(baseURL + "/user/tasks/" + todo.id).send(
        ).end (res) ->
          expectCode res, 200
          body = res.body
          expect(body).to.be.empty
          done()

      it "Does not delete already deleted todo", (done) ->
        request.del(baseURL + "/user/tasks/" + todo.id).send(
        ).end (res) ->
          expectCode res, 404
          body = res.body
          expect(body.err).to.equal "Task not found."
          done()

      it "Does not update text, attribute, priority, value, notes if task is already deleted", (done) ->
        request.put(baseURL + "/user/tasks/" + todo.id).send(
          text: "New Title"
          attribute: "str"
          priority: 1
          value: 4
          notes: "Other notes"
        ).end (res) ->
          expectCode res, 404
          body = res.body
          expect(body.err).to.equal "Task not found."
          done()
