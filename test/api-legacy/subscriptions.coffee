'use strict'

payments = require("../../website/src/controllers/payments")
app = require("../../website/src/server")

describe "Subscriptions", ->

  tasks = []

  before (done) ->
    registerNewUser((-> 
      user.getTasks (err, userTasks) -> 
        done(err) if err
        tasks = userTasks
        done()), true)

  it "Handles unsubscription", (done) ->
    cron = ->
      user.lastCron = moment().subtract(1, "d")
      daysMissed = user.fns.shouldCronRun()
      user.fns.cron({tasks: tasks, daysMissed: daysMissed}) if daysMissed isnt 0

    expect(user.purchased.plan.customerId).to.not.exist
    payments.createSubscription
      user: user
      customerId: "123"
      paymentMethod: "Stripe"
      sub: {key: 'basic_6mo'}

    expect(user.purchased.plan.customerId).to.exist
    shared.wrap user
    cron()
    expect(user.purchased.plan.customerId).to.exist
    payments.cancelSubscription user: user
    cron()
    expect(user.purchased.plan.customerId).to.exist
    expect(user.purchased.plan.dateTerminated).to.exist
    user.purchased.plan.dateTerminated = moment().subtract(2, "d")
    cron()
    expect(user.purchased.plan.customerId).to.not.exist
    payments.createSubscription
      user: user
      customerId: "123"
      paymentMethod: "Stripe"
      sub: {key: 'basic_6mo'}

    expect(user.purchased.plan.dateTerminated).to.not.exist
    done()
