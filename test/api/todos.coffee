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

      it "Creates a completed a todo when using up url", (done) ->
        upTodo = undefined
        request.post(baseURL + "/user/tasks/withUp/up").send(
            type: "todo"
            text: "withUp"
            description: "testDesc"
        ).end (res) ->
          expectCode res, 200
          request.get(baseURL + "/user/tasks/withUp")
          .send().end (res) ->
            upTodo = res.body
            expect(upTodo.completed).to.equal true
            done()

      it "Creates an uncompleted todo when using down url", (done) ->
        downTodo = undefined
        request.post(baseURL + "/user/tasks/withDown/down").send(
            type: "todo"
            text: "withDown"
            description: "testDesc"
        ).end (res) ->
          expectCode res, 200
          request.get(baseURL + "/user/tasks/withDown")
          .send().end (res) ->
            downTodo = res.body
            expect(downTodo.completed).to.equal false
            done()

      it "Creates a completed a todo overriding the complete parameter when using up url", (done) ->
        upTodo = undefined
        request.post(baseURL + "/user/tasks/withUpWithComplete/up").send(
            type: "todo"
            text: "withUpWithComplete"
            complete: false
            description: "testDesc"
        ).end (res) ->
          expectCode res, 200
          request.get(baseURL + "/user/tasks/withUpWithComplete")
          .send().end (res) ->
            upTodo = res.body
            expect(upTodo.completed).to.equal true
            done()

      it "Creates an uncompleted todo verriding the complete when using down url", (done) ->
        downTodo = undefined
        request.post(baseURL + "/user/tasks/withDownWithUncomplete/down").send(
            type: "todo"
            text: "withDownWithUncomplete"
            complete: true
            description: "testDesc"
        ).end (res) ->
          expectCode res, 200
          request.get(baseURL + "/user/tasks/withDownWithUncomplete")
          .send().end (res) ->
            downTodo = res.body
            expect(downTodo.completed).to.equal false
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

      it "It completes a todo when using up url", (done) ->
        unCompletedTodo = undefined
        request.post(baseURL + "/user/tasks").send(
            type: "todo"
            text: "Sample Todo"
        ).end (res) ->
          expectCode res, 200
          unCompletedTodo = res.body
          expect(unCompletedTodo.completed).to.equal false
          request.post(baseURL + "/user/tasks/"+unCompletedTodo._id+"/up").send(
          ).end (res) ->
            expectCode res, 200
            request.get(baseURL + "/user/tasks/"+unCompletedTodo._id)
            .send().end (res) ->
              unCompletedTodo = res.body
              expect(unCompletedTodo.completed).to.equal true
              done()

      it "It uncompletes a todo when using down url", (done) ->
        completedTodo = undefined
        request.post(baseURL + "/user/tasks").send(
            type: "todo"
            text: "Sample Todo"
            completed: true
        ).end (res) ->
          expectCode res, 200
          completedTodo = res.body
          expect(completedTodo.completed).to.equal true
          request.post(baseURL + "/user/tasks/"+completedTodo._id+"/down").send(
          ).end (res) ->
            expectCode res, 200
            request.get(baseURL + "/user/tasks/"+completedTodo._id)
            .send().end (res) ->
              completedTodo = res.body
              expect(completedTodo.completed).to.equal false
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

describe "habits", ->

  it "Creates and scores up a habit when using up url", (done) ->
    upHabit = undefined
    request.post(baseURL + "/user/tasks/habitWithUp/up").send(
        type: "habit"
        text: "testTitle"
        complete: true
        description: "testDesc"
    ).end (res) ->
      expectCode res, 200
      request.get(baseURL + "/user/tasks/habitWithUp")
      .send().end (res) ->
        upHabit = res.body
        expect(upHabit.value).to.be.at.least(1);
        expect(upHabit.type).to.equal("habit");
        done()

  it "Creates and scores down a habit when using down url", (done) ->
    downHabit = undefined
    request.post(baseURL + "/user/tasks/habitWithDown/down").send(
        type: "habit"
        text: "testTitle"
        complete: true
        description: "testDesc"
    ).end (res) ->
      expectCode res, 200
      request.get(baseURL + "/user/tasks/habitWithDown")
      .send().end (res) ->
        downHabit = res.body
        expect(downHabit.value).to.have.at.most(-1);
        expect(downHabit.type).to.equal("habit");
        done()
