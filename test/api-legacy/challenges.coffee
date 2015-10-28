'use strict'

app = require("../../website/src/server")
Group = require("../../website/src/models/group").model
Challenge = require("../../website/src/models/challenge").model
Task = require("../../website/src/models/task").model

describe "Challenges", ->

  challenge = undefined
  updateTodo = undefined
  group = undefined

  beforeEach (done) ->
    async.waterfall [
      (cb) ->
        registerNewUser(cb, true)
      , (user, cb) ->
        request.post(baseURL + "/groups").send(
          name: "TestGroup"
          type: "party"
        ).end (err, res) ->
          expectCode res, 200
          group = res.body
          expect(group.members.length).to.equal 1
          expect(group.leader).to.equal user._id
          cb()
      , (cb) ->
        request.post(baseURL + "/challenges").send(
          group: group._id
          dailys: [
            type: "daily"
            text: "Challenge Daily"
          ]
          todos: [{
            type: "todo"
            text: "Challenge Todo 1"
            notes: "Challenge Notes Todo 1"
          }]
          rewards: []
          habits: []
        ).end (err, res) ->
          challenge = res.body
          done()
      ]

  describe 'POST /challenge', ->
    
    it "Creates a challenge", (done) ->
      request.post(baseURL + "/challenges").send(
        group: group._id
        dailys: [
          type: "daily"
          text: "Challenge Daily"
        ]
        todos: [{
          type: "todo"
          text: "Challenge Todo 1"
          notes: "Challenge Notes Todo 1"
        }, {
          type: "todo"
          text: "Challenge Todo 2"
          notes: "Challenge Notes Todo 2"
        }]
        rewards: []
        habits: []
        official: true
      ).end (err, res) ->
        expectCode res, 200
        async.parallel [
          (cb) ->
            User.findById user._id, (err, user) ->
              return cb(err) if err
              user.getTransformedData(cb)
          (cb) ->
            Challenge.findById res.body._id, (err, _chal) ->
              _chal.getTransformedData cb
        ], (err, results) ->
          user = results[0]
          challenge = results[1]
          expect(user.dailys[user.dailys.length - 1].text).to.equal "Challenge Daily"
          expect(challenge.official).to.equal false
          done()

  describe 'POST /challenge/:cid', ->
    it "updates the notes on user's version of a challenge task's note without updating the challenge", (done) ->
      updateTodo = challenge.todos[0]
      userTodoId = null;
      updateTodo.notes = "User overriden notes"
      async.waterfall [
        (cb) ->
          Task.findOne {
              userId: user._id,
              type: 'todo',
              'challenge.id': challenge._id
            }, cb
        , (task, cb) ->
          userTodoId = task.id
          request.put(baseURL + "/user/tasks/" + task.id).send(updateTodo).end () ->
            cb()
        , (cb) ->
          Challenge.findById challenge._id, (err, chal) ->
              return cb(err) if err
              chal.getTransformedData(cb)
        , (chal, cb) ->
          expect(chal.todos[0].notes).to.eql("Challenge Notes Todo 1")
          cb()
        , (cb) ->
          request.get(baseURL + "/user/tasks/" + userTodoId)
            .end (err, res) ->
              expect(res.body.notes).to.eql("User overriden notes")
              done()
      ]

    it "changes user's copy of challenge tasks when the challenge is updated", (done) ->
      challenge.dailys[0].text = "Updated Daily"
      request.post(baseURL + "/challenges/" + challenge._id)
        .send(challenge)
        .end (err, res) ->
          challenge = res.body
          expect(challenge.dailys[0].text).to.equal "Updated Daily"
          User.findById user._id, (err, _user) ->
            _user.getTransformedData (err, _user) ->              
              expectCode res, 200
              expect(_user.dailys[_user.dailys.length - 1].text).to.equal "Updated Daily"
              done()

    it "does not changes user's notes on tasks when challenge task notes are updated", (done) ->
      challenge.todos[0].notes = "Challenge Updated Todo Notes"
      request.post(baseURL + "/challenges/" + challenge._id)
        .send(challenge)
        .end (err, res) ->
          challenge = res.body
          expect(challenge.todos[0].notes).to.equal "Challenge Updated Todo Notes"
          User.findById user._id, (err, _user) ->
            _user.getTransformedData (err, _user) ->
              expectCode res, 200
              expect(_user.todos[_user.todos.length - 1].notes).to.equal "Challenge Notes Todo 1"
              done()


    it "shows user notes on challenge page", (done) ->
      updateTodo = challenge.todos[0]
      updateTodo.notes = "User overriden notes"
      async.waterfall [
        (cb) ->
          Task.findOne {
              userId: user._id,
              type: 'todo',
              'challenge.id': challenge._id
            }, cb
        , (todo, cb) ->
          request.put(baseURL + "/user/tasks/" + todo._id).send(updateTodo).end () ->
            cb()
        , (cb) ->
          Challenge.findById challenge._id, (err, _chal) ->
            _chal.getTransformedData (err, chal) ->
              challenge = chal
              cb(null, chal)
        , (chal, cb) ->
          expect(chal.todos[0].notes).to.eql("Challenge Notes Todo 1")
          cb()
        , (cb) ->
          request.get(baseURL + "/challenges/" + challenge._id + "/member/" + user._id).end (err, res) ->
            expect(res.body.todos[res.body.todos.length - 1].notes).to.equal "User overriden notes"
            done()
      ]

  it "Complete To-Dos", (done) ->
    User.findById user._id, (err, _user) ->
      u = _user
      u.getTransformedData (err, u) ->
        numTasks = (_.size(u.todos))
        request.post(baseURL + "/user/tasks/" + u.todos[0].id + "/up").end () ->
          request.post(baseURL + "/user/tasks/clear-completed").end (err, res) ->
            expect(_.size(res.body)).to.equal(numTasks - 1)
            done()

  it "Challenge deleted, breaks task link", (done) ->
    itThis = this
    request.del(baseURL + "/challenges/" + challenge._id).end (err, res) ->
      User.findById user._id, (err, user) ->
        user.getTransformedData (err, user) ->
          len = user.dailys.length - 1
          daily = user.dailys[user.dailys.length - 1]
          dailyId = daily._id
          expect(daily.challenge.broken).to.equal "CHALLENGE_DELETED"

          # Now let's handle if challenge was deleted, but didn't get to update all the users (an error)
          unset = $unset: {
            'challenge.broken': 1
          }
          Task.findByIdAndUpdate dailyId, unset, {new: true}, (err, daily) ->
            expect(err).to.not.exist
            expect(daily.challenge.broken).to.not.exist
            request.post(baseURL + "/user/tasks/" + daily.id + "/up").end (res) ->
              setTimeout (->
                User.findById user._id, (err, user) ->
                  user.getTransformedData (err, user) ->
                    expect(user.dailys[len].challenge.broken).to.equal "CHALLENGE_DELETED"
                    done()
              ), 100 # we need to wait for challenge to update user, it's a background job for perf reasons

  it "admin creates a challenge", (done) ->
    User.findByIdAndUpdate user._id,
      $set:
        "contributor.admin": true
    , (err, _user) ->
      expect(err).to.not.exist
      async.parallel [
        (cb) ->
          request.post(baseURL + "/challenges").send(
            group: group._id
            dailys: []
            todos: []
            rewards: []
            habits: []
            official: false
          ).end (err, res) ->
            expect(res.body.official).to.equal false
            cb()
        (cb) ->
          request.post(baseURL + "/challenges").send(
            group: group._id
            dailys: []
            todos: []
            rewards: []
            habits: []
            official: true
          ).end (err, res) ->
            expect(res.body.official).to.equal true
            cb()
      ], done

  it "User creates a non-tavern challenge with prize, deletes it, gets refund", (done) ->
    User.findByIdAndUpdate user._id,
      $set:
        "balance": 8
    , (err, user) ->
      expect(err).to.not.be.ok
      request.post(baseURL + "/challenges").send(
        group: group._id
        dailys: []
        todos: []
        rewards: []
        habits: []
        prize: 10
      ).end (err, res) ->
        expect(res.body.prize).to.equal 10
        async.parallel [
          (cb) ->
            User.findById user._id, cb
          (cb) ->
            Challenge.findById res.body._id, cb
        ], (err, results) ->
          user = results[0]
          challenge = results[1]
          expect(user.balance).to.equal 5.5
          request.del(baseURL + "/challenges/" + challenge._id).end (err, res) ->
            User.findById user._id, (err, _user) ->
              expect(_user.balance).to.equal 8
              done()

  it "User creates a tavern challenge with prize, deletes it, and does not get refund", (done) ->
    User.findByIdAndUpdate user._id,
      $set:
        "balance": 8
    , (err, user) ->
      expect(err).to.not.be.ok
      request.post(baseURL + "/challenges").send(
        group: 'habitrpg'
        dailys: []
        todos: []
        rewards: []
        habits: []
        prize: 10
      ).end (err, res) ->
        expect(res.body.prize).to.equal 10
        async.parallel [
          (cb) ->
            User.findById user._id, cb
          (cb) ->
            Challenge.findById res.body._id, cb
        ], (err, results) ->
          user = results[0]
          challenge = results[1]
          expect(user.balance).to.equal 5.5
          request.del(baseURL + "/challenges/" + challenge._id).end (err, res) ->
            User.findById user._id, (err, _user) ->
              expect(_user.balance).to.equal 5.5
              done()

  describe "non-owner permissions", () ->
    challenge = undefined

    beforeEach (done) ->
      async.waterfall [
        (cb) ->
          request.post(baseURL + "/challenges").send(
            group: group._id
            name: 'challenge name'
            dailys: [
              type: "daily"
              text: "Challenge Daily"
            ]
          ).end (err, res) ->
            challenge = res.body
            cb()

        (cb) ->
          registerNewUser(done, true)
        ]

    context "non-owner", () ->

      it 'can not edit challenge', (done) ->
        challenge.name = 'foobar'
        request.post(baseURL + "/challenges/" + challenge._id)
          .send(challenge)
          .end (err, res) ->
            error = res.body.err

            expect(error).to.eql("You don't have permissions to edit this challenge")
            done()

      it 'can not close challenge', (done) ->
        request.post(baseURL + "/challenges/" + challenge._id + "/close?uid=" + user._id)
          .end (err, res) ->
            error = res.body.err

            expect(error).to.eql("You don't have permissions to close this challenge")
            done()

      it 'can not delete challenge', (done) ->
        request.del(baseURL + "/challenges/" + challenge._id)
          .end (err, res) ->
            error = res.body.err

            expect(error).to.eql("You don't have permissions to delete this challenge")
            done()

    context "non-owner that is an admin", () ->

      beforeEach (done) ->
        User.findByIdAndUpdate(user._id, { 'contributor.admin': true }, done)
          
      it 'can edit challenge', (done) ->
        challenge.name = 'foobar'
        request.post(baseURL + "/challenges/" + challenge._id)
          .send(challenge)
          .end (err, res) ->
            expect(res.body.err).to.not.exist
            Challenge.findById challenge._id, (err, chal) ->
              expect(chal.name).to.eql('foobar')
              done()

      it 'can close challenge', (done) ->
        request.post(baseURL + "/challenges/" + challenge._id + "/close?uid=" + user._id)
          .end (err, res) ->
            expect(res.body.err).to.not.exist
            User.findById user._id, (err, usr) ->
              expect(usr.achievements.challenges[0]).to.eql(challenge.name)
              done()

      it 'can delete challenge', (done) ->
        request.del(baseURL + "/challenges/" + challenge._id)
          .end (err, res) ->
            expect(res.body.err).to.not.exist
            request.get(baseURL + "/challenges/" + challenge._id)
              .end (err, res) ->
                error = res.body.err
                expect(error).to.eql("Challenge #{challenge._id} not found")
                done()
