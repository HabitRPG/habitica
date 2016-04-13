import nconf from 'nconf';
import stripeModule from 'stripe';
import async from 'async';
import payments from './index';
import { model as User } from '../../models/user';
import shared from '../../../../../common';
import mongoose from 'mongoose';
import cc from 'coupon-code';

const stripe = stripeModule(nconf.get('STRIPE_API_KEY'));

let api = {};
/*
 Setup Stripe response when posting payment
 */
api.checkout = function checkout (req, res) {
  let token = req.body.id;
  let user = res.locals.user;
  let gift = req.query.gift ? JSON.parse(req.query.gift) : undefined;
  let sub = req.query.sub ? shared.content.subscriptionBlocks[req.query.sub] : false;

  async.waterfall([
    function stripeCharge (cb) {
      if (sub) {
        async.waterfall([
          function handleCoupon (cb2) {
            if (!sub.discount) return cb2(null, null);
            if (!req.query.coupon) return cb2('Please provide a coupon code for this plan.');
            mongoose.model('Coupon').findOne({_id: cc.validate(req.query.coupon), event: sub.key}, cb2);
          },
          function createCustomer (coupon, cb2) {
            if (sub.discount && !coupon) return cb2('Invalid coupon code.');
            let customer = {
              email: req.body.email,
              metadata: {uuid: user._id},
              card: token,
              plan: sub.key,
            };
            stripe.customers.create(customer, cb2);
          },
        ], cb);
      } else {
        let amount;
        if (!gift) {
          amount = '500';
        } else if (gift.type === 'subscription') {
          amount = `${shared.content.subscriptionBlocks[gift.subscription.key].price * 100}`;
        } else {
          amount = `${gift.gems.amount / 4 * 100}`;
        }
        stripe.charges.create({
          amount,
          currency: 'usd',
          card: token,
        }, cb);
      }
    },
    function saveUserData (response, cb) {
      if (sub) return payments.createSubscription({user, customerId: response.id, paymentMethod: 'Stripe', sub}, cb);
      async.waterfall([
        function findUser (cb2) {
          User.findById(gift ? gift.uuid : undefined, cb2);
        },
        function prepData (member, cb2) {
          let data = {user, customerId: response.id, paymentMethod: 'Stripe', gift};
          let method = 'buyGems';
          if (gift) {
            gift.member = member;
            if (gift.type === 'subscription') method = 'createSubscription';
            data.paymentMethod = 'Gift';
          }
          payments[method](data, cb2);
        },
      ], cb);
    },
  ], function handleResponse (err) {
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.sendStatus(200);
    user = token = null;
  });
};

api.subscribeCancel = function subscribeCancel (req, res) {
  let user = res.locals.user;
  if (!user.purchased.plan.customerId) {
    return res.status(401).json({err: 'User does not have a plan subscription'});
  }

  async.auto({
    getCustomer: function getCustomer (cb) {
      stripe.customers.retrieve(user.purchased.plan.customerId, cb);
    },
    deleteCustomer: ['getCustomer', function deleteCustomer (cb) {
      stripe.customers.del(user.purchased.plan.customerId, cb);
    }],
    cancelSubscription: ['getCustomer', function cancelSubscription (cb, results) {
      let data = {
        user,
        nextBill: results.get_cus.subscription.current_period_end * 1000, // timestamp is in seconds
        paymentMethod: 'Stripe',
      };
      payments.cancelSubscription(data, cb);
    }],
  }, function handleResponse (err) {
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.redirect('/');
    user = null;
  });
};

api.subscribeEdit = function subscribeEdit (req, res) {
  let token = req.body.id;
  let user = res.locals.user;
  let userId = user.purchased.plan.customerId;
  let subscriptionId;

  async.waterfall([
    function listSubscriptions (cb) {
      stripe.customers.listSubscriptions(userId, cb);
    },
    function updateSubscription (response, cb) {
      subscriptionId = response.data[0].id;
      stripe.customers.updateSubscription(userId, subscriptionId, { card: token }, cb);
    },
    function saveUser (response, cb) {
      user.save(cb);
    },
  ], function handleResponse (err) {
    if (err) return res.send(500, err.toString()); // don't json this, let toString() handle errors
    res.sendStatus(200);
    token = user = userId = subscriptionId;
  });
};

module.exports = api;
