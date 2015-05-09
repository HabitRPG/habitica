#jslint node: true
# @TODO: refactor tests
#global describe, before, beforeEach, it
"use strict"
_ = require("lodash")
expect = require("expect.js")
async = require("async")
diff = require("deep-diff")
superagentDefaults = require("superagent-defaults")
request = superagentDefaults()
path = require("path")
moment = require("moment")
conf = require("nconf")
conf.argv().env().file(file: path.join(__dirname, "../config.json")).defaults()
conf.set "PORT", "1337"

# Override normal ENV values with nconf ENV values (ENV values are used the same way without nconf)
process.env.BASE_URL = conf.get("BASE_URL")
process.env.FACEBOOK_KEY = conf.get("FACEBOOK_KEY")
process.env.FACEBOOK_SECRET = conf.get("FACEBOOK_SECRET")
process.env.NODE_DB_URI = "mongodb://localhost/habitrpg_test"
User = require("../website/src/models/user").model
Group = require("../website/src/models/group").model
Challenge = require("../website/src/models/challenge").model
app = require("../website/src/server")
shared = require("../common")
payments = require("../website/src/controllers/payments")

# ###### Helpers & Variables ######
model = undefined
uuid = undefined
taskPath = undefined
baseURL = "http://localhost:" + conf.get("PORT") + "/api/v2"
expectCode = (res, code) ->
  expect(res.body.err).to.be `undefined`  if code is 200
  expect(res.statusCode).to.be code

describe "API", ->
  user = undefined
  _id = undefined
  apiToken = undefined
  username = undefined
  password = undefined

  registerNewUser = (cb, main) ->
    main = true unless main?
    randomID = shared.uuid()
    username = password = randomID  if main
    request
      .post(baseURL + "/register")
      .set("Accept", "application/json")
      .set("X-API-User", null)
      .set("X-API-Key", null)
      .send
        username: randomID
        password: randomID
        confirmPassword: randomID
        email: randomID + "@gmail.com"
      .end (res) ->
        return cb(null, res.body)  unless main
        _id = res.body._id
        apiToken = res.body.apiToken
        User.findOne
          _id: _id
          apiToken: apiToken
        , (err, _user) ->
          expect(err).to.not.be.ok()
          user = _user
          request
            .set("Accept", "application/json")
            .set("X-API-User", _id)
            .set("X-API-Key", apiToken)
          cb null, res.body

  registerManyUsers = (number, callback) ->
    async.times number, (n, next) ->
      registerNewUser (err, user) ->
        next(err, user)
      , false
    , (err, users) ->
      callback(err, users)

  before (done) ->
    require "../website/src/server" # start the server
    # then wait for it to do it's thing. TODO make a cb-compatible export of server
    setTimeout done, 2000

  describe "Without token or user id", ->
    it "/api/v2/status", (done) ->
      request.get(baseURL + "/status").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.be 200
        expect(res.body.status).to.be "up"
        done()

    it "/api/v2/user", (done) ->
      request.get(baseURL + "/user").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.be 401
        expect(res.body.err).to.be "You must include a token and uid (user id) in your request"
        done()

  describe "With token and user id", ->
    before (done) ->
      registerNewUser done, true

    beforeEach (done) ->
      User.findById _id, (err, _user) ->
        user = _user
        shared.wrap user
        done()

    describe "Todos", ->
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
          expect(_.size(res.body.todos)).to.be numTasks + 3
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
            expect(_.size(res.body.todos)).to.be numTasks
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
              expect(_.size(res.body.todos)).to.be numTasks - 2
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
              expect(todo.text).to.be "Sample Todo"
              expect(todo.id).to.be.ok
              expect(todo.value).to.be 0
              done()

        describe "Updating todos", ->
          it "Does not update id of todo", (done) ->
            request.put(baseURL + "/user/tasks/" + todo.id).send(
              id: "a-new-id"
            ).end (res) ->
              expectCode res, 200
              updateTodo = res.body
              expect(updateTodo.id).to.be todo.id
              done()

          it "Does not update type of todo", (done) ->
            request.put(baseURL + "/user/tasks/" + todo.id).send(
              type: "habit"
            ).end (res) ->
              expectCode res, 200
              updateTodo = res.body
              expect(updateTodo.type).to.be todo.type
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
              expect(todo.text).to.be "Changed Title"
              expect(todo.attribute).to.be "int"
              expect(todo.priority).to.be 1.5
              expect(todo.value).to.be 5
              expect(todo.notes).to.be "Some notes"
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
              expect(body.err).to.be "Task not found."
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
              expect(body.err).to.be "Task not found."
              done()

    ###*
    GROUPS
    ###
    describe "Groups", ->
      group = undefined
      before (done) ->
       request.post(baseURL + "/groups").send(
         name: "TestGroup"
         type: "party"
       ).end (res) ->
         expectCode res, 200
         group = res.body
         expect(group.members.length).to.be 1
         expect(group.leader).to.be user._id
         done()

      describe "Guilds", ->

        before (done) ->
          User.findByIdAndUpdate user._id,
            $set:
              "balance": 4
            , (err, _user) ->
              done()

        describe "Private Guilds", ->
          guild = undefined
          before (done) ->
            request.post(baseURL + "/groups").send(
              name: "TestPrivateGroup"
              type: "guild"
              privacy: "private"
            ).end (res) ->
              expectCode res, 200
              guild = res.body
              expect(guild.members.length).to.be 1
              expect(guild.leader).to.be user._id
              #Add members to guild
              async.waterfall [
                (cb) ->
                  registerManyUsers 15, cb

                (_members, cb) ->
                  members = _members

                  joinGuild = (member, callback) ->
                    request.post(baseURL + "/groups/" + guild._id + "/join")
                      .set("X-API-User", member._id)
                      .set("X-API-Key", member.apiToken)
                      .end ->
                        callback(null, null)

                  async.map members, joinGuild, (err, results) -> cb()

              ], done

          it "includes user in private group member list when user is a member", (done) ->

            request.get(baseURL + "/groups/" + guild._id)
            .end (res) ->
              g = res.body
              userInGroup = _.find g.members, (member) -> return member._id == user._id
              expect(userInGroup).to.not.be undefined
              done()

          it "excludes user from viewing private group member list when user is not a member", (done) ->

            request.post(baseURL + "/groups/" + guild._id + "/leave")
              .end (res) ->
                request.get(baseURL + "/groups/" + guild._id)
                .end (res) ->
                  expect res, 404
                  done()

        describe "Public Guilds", ->
          guild = undefined
          before (done) ->
            request.post(baseURL + "/groups").send(
              name: "TestPublicGroup"
              type: "guild"
              privacy: "public"
            ).end (res) ->
              expectCode res, 200
              guild = res.body
              expect(guild.members.length).to.be 1
              expect(guild.leader).to.be user._id
              #Add members to guild
              async.waterfall [
                (cb) ->
                  registerManyUsers 15, cb

                (_members, cb) ->
                  members = _members

                  joinGuild = (member, callback) ->
                    request.post(baseURL + "/groups/" + guild._id + "/join")
                      .set("X-API-User", member._id)
                      .set("X-API-Key", member.apiToken)
                      .end ->
                        callback(null, null)

                  async.map members, joinGuild, (err, results) -> cb()
              ], done

          it "includes user in public group member list when user is a member", (done) ->

            request.get(baseURL + "/groups/" + guild._id)
              .end (res) ->
                g = res.body
                expect(g.members.length).to.be 15
                userInGroup = _.find g.members, (member) -> return member._id == user._id
                expect(userInGroup).to.not.be undefined
                done()


          it "excludes user in public group member list when user is not a member", (done) ->
            #Remove user from group
            request.post(baseURL + "/groups/" + guild._id + "/leave")
              .end (res) ->
                #Verfiy that when a user query's for a group they are in the group if they are a member
                request.get(baseURL + "/groups/" + guild._id)
                  .end (res) ->
                    g = res.body
                    expect(g.members.length).to.be 15
                    userInGroup = _.find g.members, (member) -> return member._id == user._id
                    expect(userInGroup).to.be undefined
                    done()

      describe "Party", ->
        it "can be found by querying for party", (done) ->
          request.get(baseURL + "/groups/").send(
            type: "party"
          ).end (res) ->
            expectCode res, 200
            party = res.body[0]
            expect(party._id).to.be group._id
            expect(party.leader).to.be user._id
            expect(party.name).to.be group.name
            expect(party.quest).to.be.eql { progress: {} }
            expect(party.memberCount).to.be group.memberCount
            done()

        it "includes user in a party member list when user is a member", (done) ->
          party = []

          #Invite some members
          async.waterfall [

            # Register new users
            (cb) ->
              registerManyUsers 15, cb

            # Send them invitations
            (_party, cb) ->
              party = _party

              joinParty = (member, callback) ->
                request.post(baseURL + "/groups/" + group._id + "/join")
                  .set("X-API-User", member._id)
                  .set("X-API-Key", member.apiToken)
                  .end ->
                    callback(null, null)

              async.map party, joinParty, (err, results) -> cb()

            # Accept / Reject
            (cb) ->
              # series since they'll be modifying the same group record
              series = _.reduce(party, (m, v, i) ->
                m.push (cb2) ->
                  request.post(baseURL + "/groups/" + group._id + "/join")
                    .set("X-API-User", party[i]._id)
                    .set("X-API-Key", party[i].apiToken)
                    .end ->
                      cb2()
                m
              , [])
              async.series series, cb

            # Make sure the invites stuck
            (result, cb) ->
              request.get(baseURL + "/groups/" + group._id)
              .send()
              .end (res) ->
                g = res.body
                userInGroup = _.find g.members, (member) -> return member._id == user._id
                expect(userInGroup).to.not.be undefined
                cb()

            # Remove all previous members
            (cb) ->

              joinParty = (member, callback) ->
                request.post(baseURL + "/groups/" + group._id + "/leave")
                  .set("X-API-User", member._id)
                  .set("X-API-Key", member.apiToken)
                  .end ->
                    callback(null, null)

              async.map party, joinParty, (err, results) -> cb()

          ], done

        it "excludes user in a party member list when user is not a member", (done) ->
          party = []

          #Invite some members
          async.waterfall [

            # Register new users
            (cb) ->
              registerManyUsers 15, cb

            # Send them invitations
            (_party, cb) ->
              party = _party

              joinParty = (member, callback) ->
                request.post(baseURL + "/groups/" + group._id + "/join")
                  .set("X-API-User", member._id)
                  .set("X-API-Key", member.apiToken)
                  .end ->
                    callback(null, null)

              async.map party, joinParty, (err, results) -> cb()

            # Accept / Reject
            (cb) ->
              # series since they'll be modifying the same group record
              series = _.reduce(party, (m, v, i) ->
                m.push (cb2) ->
                  request.post(baseURL + "/groups/" + group._id + "/join")
                    .set("X-API-User", party[i]._id)
                    .set("X-API-Key", party[i].apiToken)
                    .end ->
                      cb2()
                m
              , [])
              async.series series, cb

            (result, cb) ->
              #Remove a user from group
              request.post(baseURL + "/groups/" + group._id + "/leave")
              .set("X-API-User", party[0]._id)
              .set("X-API-Key", party[0].apiToken)
              .send()
              .end (res) ->
                request.get(baseURL + "/groups/" + group._id)
                .set("X-API-User", party[0]._id)
                .set("X-API-Key", party[0].apiToken)
                .send()
                .end (res) ->
                  expect res, 404
                  cb()

            # Remove all previous members
            (cb) ->

              joinParty = (member, callback) ->
                request.post(baseURL + "/groups/" + group._id + "/leave")
                  .set("X-API-User", member._id)
                  .set("X-API-Key", member.apiToken)
                  .end ->
                    callback(null, null)

              async.map party, joinParty, (err, results) -> cb()

          ], done

        describe "Chat", ->
          chat = undefined
          it "Posts a message to party chat", (done) ->
            msg = "TestMsg"
            request.post(baseURL + "/groups/" + group._id + "/chat?message=" + msg).send(
            ).end (res) ->
              expectCode res, 200
              chat = res.body.message
              expect(chat.id).to.be.ok
              expect(chat.text).to.be.eql msg
              expect(chat.timestamp).to.be.ok
              expect(chat.likes).to.be.empty
              expect(chat.flags).to.be.empty
              expect(chat.flagCount).to.be 0
              expect(chat.uuid).to.be.ok
              expect(chat.contributor).to.be.empty
              expect(chat.backer).to.be.empty
              expect(chat.uuid).to.be user._id
              expect(chat.user).to.be user.profile.name
              done()

          it "Does not post an empty message", (done) ->
            msg = ""
            request.post(baseURL + "/groups/" + group._id + "/chat?message=" + msg).send(
            ).end (res) ->
              expectCode res, 400
              expect(res.body.err).to.be.eql 'You cannot send a blank message'
              done()

          it "can not like own chat message", (done) ->
            request.post(baseURL + "/groups/" + group._id + "/chat/" + chat.id + "/like").send(
            ).end (res) ->
              expectCode res, 401
              body = res.body
              expect(body.err).to.be "Can't like your own message. Don't be that person."
              done()

          it "can not flag own message", (done) ->
            request.post(baseURL + "/groups/" + group._id + "/chat/" + chat.id + "/flag").send(
            ).end (res) ->
              expectCode res, 401
              body = res.body
              expect(body.err).to.be "Can't report your own message."
              done()

          it "Gets chat messages from party chat", (done) ->
            request.get(baseURL + "/groups/" + group._id + "/chat").send(
            ).end (res) ->
              expectCode res, 200
              message = res.body[0]
              expect(message.id).to.be chat.id
              expect(message.timestamp).to.be chat.timestamp
              expect(message.likes).to.be.eql chat.likes
              expect(message.flags).to.be.eql chat.flags
              expect(message.flagCount).to.be chat.flagCount
              expect(message.uuid).to.be chat.uuid
              expect(message.contributor).to.be.eql chat.contributor
              expect(message.backer).to.be.eql chat.backer
              expect(message.user).to.be chat.user
              done()

          it "Deletes a chat messages from party chat", (done) ->
            request.del(baseURL + "/groups/" + group._id + "/chat/" + chat.id).send(
            ).end (res) ->
              expectCode res, 204
              expect(res.body).to.be.empty
              done()

          it "Can not delete already deleted message", (done) ->
            request.del(baseURL + "/groups/" + group._id + "/chat/" + chat.id).send(
            ).end (res) ->
              expectCode res, 404
              body = res.body
              expect(body.err).to.be "Message not found!"
              done()

      describe "Challenges", ->
        challenge = undefined
        updateTodo = undefined
        it "Creates a challenge", (done) ->
          request.post(baseURL + "/challenges").send(
            group: group._id
            dailys: [
              type: "daily"
              text: "Challenge Daily"
            ]
            todos: [
              type: "todo"
              text: "Challenge Todo"
              notes: "Challenge Notes"
            ]
            rewards: []
            habits: []
            official: true
          ).end (res) ->
            expectCode res, 200
            async.parallel [
              (cb) ->
                User.findById _id, cb
              (cb) ->
                Challenge.findById res.body._id, cb
            ], (err, results) ->
              _user = results[0]
              challenge = results[1]
              expect(_user.dailys[_user.dailys.length - 1].text).to.be "Challenge Daily"
              updateTodo = _user.todos[_user.todos.length - 1]
              expect(updateTodo.text).to.be "Challenge Todo"
              expect(challenge.official).to.be false
              done()

        it "User updates challenge notes", (done) ->
          updateTodo.notes = "User overriden notes"
          request.put(baseURL + "/user/tasks/" + updateTodo.id).send(updateTodo).end (res) ->
            done() # we'll do the check down below

        it "Change challenge daily", (done) ->
          challenge.dailys[0].text = "Updated Daily"
          challenge.todos[0].notes = "Challenge Updated Todo Notes"
          request.post(baseURL + "/challenges/" + challenge._id).send(challenge).end (res) ->
            setTimeout (->
              User.findById _id, (err, _user) ->
                expectCode res, 200
                expect(_user.dailys[_user.dailys.length - 1].text).to.be "Updated Daily"
                expect(res.body.todos[0].notes).to.be "Challenge Updated Todo Notes"
                expect(_user.todos[_user.todos.length - 1].notes).to.be "User overriden notes"
                user = _user
                done()
            ), 500 # we have to wait a while for users' tasks to be updated, called async on server

        it "Shows user notes on challenge page", (done) ->
          request.get(baseURL + "/challenges/" + challenge._id + "/member/" + _id).end (res) ->
            expect(res.body.todos[res.body.todos.length - 1].notes).to.be "User overriden notes"
            done()

        it "Complete To-Dos", (done) ->
          u = user
          numTasks = (_.size(u.todos))
          request.post(baseURL + "/user/tasks/" + u.todos[0].id + "/up").end (res) ->
            request.post(baseURL + "/user/tasks/" + u.todos[1].id + "/up").end (res) ->
              request.post(baseURL + "/user/tasks/").send(type: "todo").end (res) ->
                request.post(baseURL + "/user/tasks/clear-completed").end (res) ->
                  # 2 tasks set to be completed, so tasks should equal numTasks - 2
                  expect(_.size(res.body)).to.be numTasks - 2
                  done()

        it "Challenge deleted, breaks task link", (done) ->
          itThis = this
          request.del(baseURL + "/challenges/" + challenge._id).end (res) ->
            User.findById user._id, (err, user) ->
              len = user.dailys.length - 1
              daily = user.dailys[user.dailys.length - 1]
              expect(daily.challenge.broken).to.be "CHALLENGE_DELETED"

              # Now let's handle if challenge was deleted, but didn't get to update all the users (an error)
              unset = $unset: {}
              unset["$unset"]["dailys." + len + ".challenge.broken"] = 1
              User.findByIdAndUpdate user._id, unset, (err, user) ->
                expect(err).to.not.be.ok()
                expect(user.dailys[len].challenge.broken).to.not.be.ok()
                request.post(baseURL + "/user/tasks/" + daily.id + "/up").end (res) ->
                  setTimeout (->
                    User.findById user._id, (err, user) ->
                      expect(user.dailys[len].challenge.broken).to.be "CHALLENGE_DELETED"
                      done()
                  ), 100 # we need to wait for challenge to update user, it's a background job for perf reasons

        it "Admin creates a challenge", (done) ->
          User.findByIdAndUpdate _id,
            $set:
              "contributor.admin": true
          , (err, _user) ->
            expect(err).to.not.be.ok()
            async.parallel [
              (cb) ->
                request.post(baseURL + "/challenges").send(
                  group: group._id
                  dailys: []
                  todos: []
                  rewards: []
                  habits: []
                  official: false
                ).end (res) ->
                  expect(res.body.official).to.be false
                  cb()
              (cb) ->
                request.post(baseURL + "/challenges").send(
                  group: group._id
                  dailys: []
                  todos: []
                  rewards: []
                  habits: []
                  official: true
                ).end (res) ->
                  expect(res.body.official).to.be true
                  cb()
            ], done

      describe "Quests", ->
        party = undefined
        participating = []
        notParticipating = []
        before (done) ->

          # Tavern boss, side-by-side
          Group.update(
            _id: "habitrpg"
          ,
            $set:
              quest:
                key: "dilatory"
                active: true
                progress:
                  hp: shared.content.quests.dilatory.boss.hp
                  rage: 0
          ).exec()

          # Tally some progress for later. Later we want to test that progress made before the quest began gets
          # counted after the quest starts
          request.post(baseURL + "/user/batch-update").send([
            {
              op: "score"
              params:
                direction: "up"
                id: user.dailys[0].id
            }
            {
              op: "score"
              params:
                direction: "up"
                id: user.dailys[0].id
            }
            {
              op: "update"
              body:
                "stats.lvl": 50
            }
          ]).end (res) ->
            user = res.body
            expect(user.party.quest.progress.up).to.be.above 0

            # Invite some members
            async.waterfall [

              # Register new users
              (cb) ->
                registerManyUsers 3, cb

              # Send them invitations
              (_party, cb) ->
                party = _party
                inviteURL = baseURL + "/groups/" + group._id + "/invite"
                async.parallel [
                  (cb2) ->
                    request.post(inviteURL).send(
                      uuids: [party[0]._id]
                    ).end ->
                      cb2()
                  (cb2) ->
                    request.post(inviteURL).send(
                      uuids: [party[1]._id]
                    ).end ->
                      cb2()
                  (cb2) ->
                    request.post(inviteURL).send(
                      uuids: [party[2]._id]
                    ).end (res)->
                      cb2()
                ], cb

              # Accept / Reject
              (results, cb) ->

                # series since they'll be modifying the same group record
                series = _.reduce(party, (m, v, i) ->
                  m.push (cb2) ->
                    request.post(baseURL + "/groups/" + group._id + "/join").set("X-API-User", party[i]._id).set("X-API-Key", party[i].apiToken).end ->
                      cb2()
                  m
                , [])
                async.series series, cb

              # Make sure the invites stuck
              (whatever, cb) ->
                Group.findById group._id, (err, g) ->
                  group = g
                  expect(g.members.length).to.be 4
                  cb()

            ], ->

              # Start the quest
              async.waterfall [
                (cb) ->
                  request.post(baseURL + "/groups/" + group._id + "/questAccept?key=vice3").end (res) ->
                    expectCode res, 400
                    User.findByIdAndUpdate _id,
                      $set:
                        "items.quests.vice3": 1
                    , cb

                (_user, cb) ->
                  request.post(baseURL + "/groups/" + group._id + "/questAccept?key=vice3").end (res) ->
                    expectCode res, 200
                    Group.findById group._id, cb

                (_group, cb) ->
                  expect(_group.quest.key).to.be "vice3"
                  expect(_group.quest.active).to.be false
                  request.post(baseURL + "/groups/" + group._id + "/questAccept").set("X-API-User", party[0]._id).set("X-API-Key", party[0].apiToken).end ->
                    request.post(baseURL + "/groups/" + group._id + "/questAccept").set("X-API-User", party[1]._id).set("X-API-Key", party[1].apiToken).end (res) ->
                      request.post(baseURL + "/groups/" + group._id + "/questReject").set("X-API-User", party[2]._id).set("X-API-Key", party[2].apiToken).end (res) ->
                        group = res.body
                        expect(group.quest.active).to.be true
                        cb()

              ], done

        it "Casts a spell", (done) ->
          mp = user.stats.mp
          request.get(baseURL + "/members/" + party[0]._id).end (res) ->
            party[0] = res.body
            request.post(baseURL + "/user/class/cast/snowball?targetType=user&targetId=" + party[0]._id).end (res) ->

              #expect(res.body.stats.mp).to.be.below(mp)
              request.get(baseURL + "/members/" + party[0]._id).end (res) ->
                member = res.body
                expect(member.achievements.snowball).to.be 1
                expect(member.stats.buffs.snowball).to.be true
                difference = diff(member, party[0])
                expect(_.size(difference)).to.be 2

                # level up user so str is > 0
                request.put(baseURL + "/user").send("stats.lvl": 5).end (res) ->

                  # Refill mana so user can cast
                  request.put(baseURL + "/user").send("stats.mp": 100).end (res) ->
                    request.post(baseURL + "/user/class/cast/valorousPresence?targetType=party").end (res) ->
                      request.get(baseURL + "/members/" + member._id).end (res) ->
                        expect(res.body.stats.buffs.str).to.be.above 0
                        expect(diff(res.body, member).length).to.be 1
                        done()

        it "Doesn't include people who aren't participating", (done) ->
          request.get(baseURL + "/groups/" + group._id).end (res) ->
            expect(_.size(res.body.quest.members)).to.be 3
            done()

        xit "Hurts the boss", (done) ->
          request.post(baseURL + "/user/batch-update").end (res) ->
            user = res.body
            up = user.party.quest.progress.up
            expect(up).to.be.above 0

            #{op:'score',params:{direction:'up',id:user.dailys[3].id}}, // leave one daily undone so Trapper hurts party
            # set day to yesterday, cron will then be triggered on next action
            request.post(baseURL + "/user/batch-update").send([
              {
                op: "score"
                params:
                  direction: "up"
                  id: user.dailys[0].id
              }
              {
                op: "update"
                body:
                  lastCron: moment().subtract(1, "days")
              }
            ]).end (res) ->
              expect(res.body.party.quest.progress.up).to.be.above up
              request.post(baseURL + "/user/batch-update").end ->
                request.get(baseURL + "/groups/party").end (res) ->

                  # Check boss damage
                  async.waterfall [
                    (cb) ->
                      async.parallel [

                        #tavern boss
                        (cb2) ->
                          Group.findById "habitrpg",
                            quest: 1
                          , (err, tavern) ->
                            expect(tavern.quest.progress.hp).to.be.below shared.content.quests.dilatory.boss.hp
                            expect(tavern.quest.progress.rage).to.be.above 0
                            console.log tavernBoss: tavern.quest
                            cb2()

                        # party boss
                        (cb2) ->
                          expect(res.body.quest.progress.hp).to.be.below shared.content.quests.vice3.boss.hp
                          _party = res.body.members
                          expect(_.find(_party,
                            _id: party[0]._id
                          ).stats.hp).to.be.below 50
                          expect(_.find(_party,
                            _id: party[1]._id
                          ).stats.hp).to.be.below 50
                          expect(_.find(_party,
                            _id: party[2]._id
                          ).stats.hp).to.be 50
                          cb2()
                      ], cb

                    # Kill the boss
                    (whatever, cb) ->
                      async.waterfall [

                        # tavern boss
                        (cb2) ->
                          expect(user.items.pets["MantisShrimp-Base"]).to.not.be.ok()
                          Group.update
                            _id: "habitrpg"
                          ,
                            $set:
                              "quest.progress.hp": 0
                          , cb2

                        # party boss
                        (arg1, arg2, cb2) ->
                          expect(user.items.gear.owned.weapon_special_2).to.not.be.ok()
                          Group.findByIdAndUpdate group._id,
                            $set:
                              "quest.progress.hp": 0
                          , cb2
                      ], cb
                    (_group, cb) ->
                      # set day to yesterday, cron will then be triggered on next action
                      request.post(baseURL + "/user/batch-update").send([
                        {
                          op: "score"
                          params:
                            direction: "up"
                            id: user.dailys[1].id
                        }
                        {
                          op: "update"
                          body:
                            lastCron: moment().subtract(1, "days")
                        }
                      ]).end ->
                        cb()

                    (cb) ->
                      request.post(baseURL + "/user/batch-update").end (res) ->
                        cb null, res.body

                    (_user, cb) ->

                      # need to load the user again, since tavern boss does update after user's cron
                      User.findById _user._id, cb
                    (_user, cb) ->
                      user = _user
                      Group.findById group._id, cb
                    (_group, cb) ->
                      cummExp = shared.content.quests.vice3.drop.exp + shared.content.quests.dilatory.drop.exp
                      cummGp = shared.content.quests.vice3.drop.gp + shared.content.quests.dilatory.drop.gp

                      #//FIXME check that user got exp, but user is leveling up making the exp check difficult
                      #                      expect(user.stats.exp).to.be.above(cummExp)
                      #                      expect(user.stats.gp).to.be.above(cummGp)
                      async.parallel [

                        # Tavern Boss
                        (cb2) ->
                          Group.findById "habitrpg", (err, tavern) ->

                            #use an explicit get because mongoose wraps the null in an object
                            expect(_.isEmpty(tavern.get("quest"))).to.be true
                            expect(user.items.pets["MantisShrimp-Base"]).to.be 5
                            expect(user.items.mounts["MantisShrimp-Base"]).to.be true
                            expect(user.items.eggs.Dragon).to.be 2
                            expect(user.items.hatchingPotions.Shade).to.be 2
                            cb2()

                        # Party Boss
                        (cb2) ->

                          #use an explicit get because mongoose wraps the null in an object
                          expect(_.isEmpty(_group.get("quest"))).to.be true
                          expect(user.items.gear.owned.weapon_special_2).to.be true
                          expect(user.items.eggs.Dragon).to.be 2
                          expect(user.items.hatchingPotions.Shade).to.be 2

                          # need to fetch users to get updated data
                          async.parallel [
                            (cb3) ->
                              User.findById party[0].id, (err, mbr) ->
                                expect(mbr.items.gear.owned.weapon_special_2).to.be true
                                cb3()
                            (cb3) ->
                              User.findById party[1].id, (err, mbr) ->
                                expect(mbr.items.gear.owned.weapon_special_2).to.be true
                                cb3()
                            (cb3) ->
                              User.findById party[2].id, (err, mbr) ->
                                expect(mbr.items.gear.owned.weapon_special_2).to.not.be.ok()
                                cb3()
                          ], cb2
                      ], cb
                  ], done

    describe "Subscriptions", ->
      user = undefined
      before (done) ->
        User.findOne
          _id: _id
        , (err, _user) ->
          expect(err).to.not.be.ok()
          user = _user
          done()

      it "Handles unsubscription", (done) ->
        cron = ->
          user.lastCron = moment().subtract(1, "d")
          user.fns.cron()

        expect(user.purchased.plan.customerId).to.not.be.ok()
        payments.createSubscription
          user: user
          customerId: "123"
          paymentMethod: "Stripe"
          sub: {key: 'basic_6mo'}

        expect(user.purchased.plan.customerId).to.be.ok()
        shared.wrap user
        cron()
        expect(user.purchased.plan.customerId).to.be.ok()
        payments.cancelSubscription user: user
        cron()
        expect(user.purchased.plan.customerId).to.be.ok()
        expect(user.purchased.plan.dateTerminated).to.be.ok()
        user.purchased.plan.dateTerminated = moment().subtract(2, "d")
        cron()
        expect(user.purchased.plan.customerId).to.not.be.ok()
        payments.createSubscription
          user: user
          customerId: "123"
          paymentMethod: "Stripe"
          sub: {key: 'basic_6mo'}

        expect(user.purchased.plan.dateTerminated).to.not.be.ok()
        done()
