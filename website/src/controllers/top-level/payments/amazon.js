/* import async from 'async';
import cc from 'coupon-code';
import mongoose from 'mongoose';
import moment from 'moment';
import payments from './index';
import shared from '../../../../../common';
import { model as User } from '../../../models/user'; */
import {
  // NotFound,
  // NotAuthorized,
  BadRequest,
} from '../../../libs/api-v3/errors';
import amzLib from '../../../libs/api-v3/amazonPayments';
import { authWithHeaders } from '../../../middlewares/api-v3/auth';
var payments = require('./index');

let api = {};

/**
 * @api {post} /api/v3/payments/amazon/verifyAccessToken verify access token
 * @apiVersion 3.0.0
 * @apiName AmazonVerifyAccessToken
 * @apiGroup Payments
 * @apiParam {string} access_token the access token
 * @apiSuccess {} empty
 **/
api.verifyAccessToken = {
  method: 'POST',
  url: '/payments/amazon/verifyAccessToken',
  async handler (req, res) {
    await amzLib.getTokenInfo(req.body.access_token)
    .then(() => {
      res.respond(200, {});
    }).catch((error) => {
      throw new BadRequest(error.body.error_description);
    });
  },
};

/**
 * @api {post} /api/v3/payments/amazon/createOrderReferenceId create order reference id
 * @apiVersion 3.0.0
 * @apiName AmazonCreateOrderReferenceId
 * @apiGroup Payments
 * @apiParam {string} billingAgreementId billing agreement id
 * @apiSuccess {object} object containing { orderReferenceId }
 **/
api.createOrderReferenceId = {
  method: 'POST',
  url: '/payments/amazon/createOrderReferenceId',
  // middlewares: [authWithHeaders()],
  async handler (req, res) {

    try {
      let response = await amzLib.createOrderReferenceId({
        Id: req.body.billingAgreementId,
        IdType: 'BillingAgreement',
        ConfirmNow: false,
        AWSAccessKeyId: 'something',
      });
      res.respond(200, {
        orderReferenceId: response.OrderReferenceDetails.AmazonOrderReferenceId,
      });
    } catch (error) {
      throw new BadRequest(error);
    }

  },
};

/**
 * @api {post} /api/v3/payments/amazon/checkout do checkout
 * @apiVersion 3.0.0
 * @apiName AmazonCheckout
 * @apiGroup Payments
 *
 * @apiParam {string} billingAgreementId billing agreement id
 * @apiSuccess {object} object containing { orderReferenceId }
 **/
api.checkout = {
  method: 'POST',
  url: '/payments/amazon/checkout',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let gift = req.body.gift;
    let user = res.locals.user;
    let orderReferenceId = req.body.orderReferenceId;
    let amount = 5;

    if (gift) {
      if (gift.type === 'gems') {
        amount = gift.gems.amount / 4;
      } else if (gift.type === 'subscription') {
        amount = shared.content.subscriptionBlocks[gift.subscription.key].price;
      }
    }

    /* if (!req.body || !req.body.orderReferenceId) {
      return res.status(400).json({err: 'Billing Agreement Id not supplied.'});
    } */

    try {
      await amzLib.setOrderReferenceDetails({
        AmazonOrderReferenceId: orderReferenceId,
        OrderReferenceAttributes: {
          OrderTotal: {
            CurrencyCode: 'USD',
            Amount: amount,
          },
          SellerNote: 'HabitRPG Payment',
          SellerOrderAttributes: {
            SellerOrderId: shared.uuid(),
            StoreName: 'HabitRPG',
          },
        },
      });

      await amzLib.confirmOrderReference({ AmazonOrderReferenceId: orderReferenceId });

      await amzLib.authorize({
        AmazonOrderReferenceId: orderReferenceId,
        AuthorizationReferenceId: shared.uuid().substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: 'USD',
          Amount: amount,
        },
        SellerAuthorizationNote: 'HabitRPG Payment',
        TransactionTimeout: 0,
        CaptureNow: true,
      });

      await amzLib.closeOrderReference({ AmazonOrderReferenceId: orderReferenceId });

      // execute payment
      let giftUser = await User.findById(gift ? gift.uuid : undefined);
      let data = { giftUser, paymentMethod: 'Amazon Payments' };
      let method = 'buyGems';
      if (gift) {
        if (gift.type === 'subscription') method = 'createSubscription';
        gift.member = giftUser;
        data.gift = gift;
        data.paymentMethod = 'Gift';
      }
      await payments[method](data);

      res.respond(200);
    } catch(error) {
      throw new BadRequest(error);
    }
};



/*
api.subscribe = function subscribe (req, res, next) {
  if (!req.body || !req.body.billingAgreementId) {
    return res.status(400).json({err: 'Billing Agreement Id not supplied.'});
  }

  let billingAgreementId = req.body.billingAgreementId;
  let sub = req.body.subscription ? shared.content.subscriptionBlocks[req.body.subscription] : false;
  let coupon = req.body.coupon;
  let user = res.locals.user;

  if (!sub) {
    return res.status(400).json({err: 'Subscription plan not found.'});
  }

  async.series({
    applyDiscount (cb) {
      if (!sub.discount) return cb();
      if (!coupon) return cb(new Error('Please provide a coupon code for this plan.'));
      mongoose.model('Coupon').findOne({_id: cc.validate(coupon), event: sub.key}, function couponResult (err) {
        if (err) return cb(err);
        if (!coupon) return cb(new Error('Coupon code not found.'));
        cb();
      });
    },

    setBillingAgreementDetails (cb) {
      amzPayment.offAmazonPayments.setBillingAgreementDetails({
        AmazonBillingAgreementId: billingAgreementId,
        BillingAgreementAttributes: {
          SellerNote: 'HabitRPG Subscription',
          SellerBillingAgreementAttributes: {
            SellerBillingAgreementId: shared.uuid(),
            StoreName: 'HabitRPG',
            CustomInformation: 'HabitRPG Subscription',
          },
        },
      }, cb);
    },

    confirmBillingAgreement (cb) {
      amzPayment.offAmazonPayments.confirmBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId,
      }, cb);
    },

    authorizeOnBillingAgreement (cb) {
      amzPayment.offAmazonPayments.authorizeOnBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId,
        AuthorizationReferenceId: shared.uuid().substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: 'USD',
          Amount: sub.price,
        },
        SellerAuthorizationNote: 'HabitRPG Subscription Payment',
        TransactionTimeout: 0,
        CaptureNow: true,
        SellerNote: 'HabitRPG Subscription Payment',
        SellerOrderAttributes: {
          SellerOrderId: shared.uuid(),
          StoreName: 'HabitRPG',
        },
      }, function billingAgreementResult (err) {
        if (err) return cb(err);

        if (res.AuthorizationDetails.AuthorizationStatus.State === 'Declined') {
          return cb(new Error('The payment was not successful.'));
        }

        return cb();
      });
    },

    createSubscription (cb) {
      payments.createSubscription({
        user,
        customerId: billingAgreementId,
        paymentMethod: 'Amazon Payments',
        sub,
      }, cb);
    },
  }, function subscribeResult (err) {
    if (err) return next(err);

    res.sendStatus(200);
  });
};

api.subscribeCancel = function subscribeCancel (req, res, next) {
  let user = res.locals.user;
  if (!user.purchased.plan.customerId)
    return res.status(401).json({err: 'User does not have a plan subscription'});

  let billingAgreementId = user.purchased.plan.customerId;

  async.series({
    closeBillingAgreement (cb) {
      amzPayment.offAmazonPayments.closeBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId,
      }, cb);
    },

    cancelSubscription (cb) {
      let data = {
        user,
        // Date of next bill
        nextBill: moment(user.purchased.plan.lastBillingDate).add({days: 30}),
        paymentMethod: 'Amazon Payments',
      };

      payments.cancelSubscription(data, cb);
    },
  }, function subscribeCancelResult (err) {
    if (err) return next(err); // don't json this, let toString() handle errors

    if (req.query.noRedirect) {
      res.sendStatus(200);
    } else {
      res.redirect('/');
    }

    user = null;
  });
};
*/

module.exports = api;
