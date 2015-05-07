'use strict'
#jslint node: true

#global describe, before, beforeEach, it
diff = require("deep-diff")

User = require("../../website/src/models/user").model
payments = require("../../website/src/controllers/payments")
app = require("../../website/src/server")

# ###### Helpers & Variables ######
model = undefined
uuid = undefined
taskPath = undefined

describe "API", ->

  before (done) ->
    require "../../website/src/server" # start the server
    # then wait for it to do it's thing. TODO make a cb-compatible export of server
    setTimeout done, 2000

  describe "Subscriptions", ->
    before (done) ->
      registerNewUser(done, true)

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
