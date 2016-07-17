var app, payments;

payments = require("../../website/server/controllers/payments");

app = require("../../website/server/server");

describe("Subscriptions", function() {
  before(function(done) {
    return registerNewUser(done, true);
  });
  return it("Handles unsubscription", function(done) {
    var cron;
    cron = function() {
      user.lastCron = moment().subtract(1, "d");
      return user.fns.cron();
    };
    expect(user.purchased.plan.customerId).to.not.exist;
    payments.createSubscription({
      user: user,
      customerId: "123",
      paymentMethod: "Stripe",
      sub: {
        key: 'basic_6mo'
      }
    });
    expect(user.purchased.plan.customerId).to.exist;
    shared.wrap(user);
    cron();
    expect(user.purchased.plan.customerId).to.exist;
    payments.cancelSubscription({
      user: user
    });
    cron();
    expect(user.purchased.plan.customerId).to.exist;
    expect(user.purchased.plan.dateTerminated).to.exist;
    user.purchased.plan.dateTerminated = moment().subtract(2, "d");
    cron();
    expect(user.purchased.plan.customerId).to.not.exist;
    payments.createSubscription({
      user: user,
      customerId: "123",
      paymentMethod: "Stripe",
      sub: {
        key: 'basic_6mo'
      }
    });
    expect(user.purchased.plan.dateTerminated).to.not.exist;
    return done();
  });
});
