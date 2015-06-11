'use strict'

app = require("../../website/src/server")

describe "Site Status", ->

  describe "Without token or user id", ->

    it "/api/v2/status", (done) ->
      request.get(baseURL + "/status").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.equal 200
        expect(res.body.status).to.equal "up"
        done()

    it "/api/v2/user", (done) ->
      request
        .get(baseURL + "/user")
        .set("Accept", "application/json")
        .set("X-API-User", '')
        .set("X-API-Key", '')
        .end (res) ->
          expect(res.statusCode).to.equal 401
          expect(res.body.err).to.equal "You must include a token and uid (user id) in your request"
          done()

  describe "With token or user id", ->

    before (done) ->
      registerNewUser(done, true)

    it "/api/v2/status", (done) ->
      request.get(baseURL + "/status").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.equal 200
        expect(res.body.status).to.equal "up"
        done()

    it "/api/v2/user", (done) ->
      request.get(baseURL + "/user").set("Accept", "application/json").end (res) ->
        expect(res.statusCode).to.equal 200
        expect(res.body._id).to.equal user._id
        done()
