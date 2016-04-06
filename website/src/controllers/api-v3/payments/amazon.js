import amazonPayments from 'amazon-payments';
import async from 'async';
import cc from 'coupon-code';
import mongoose from 'mongoose';
import moment from 'moment';
import nconf from 'nconf';
import payments from './index';
import shared from '../../../../common';
import { model as User } from '../../models/user';

const IS_PROD = nconf.get('NODE_ENV') === 'production';

let api = {};

let amzPayment = amazonPayments.connect({
  environment: amazonPayments.Environment[IS_PROD ? 'Production' : 'Sandbox'],
  sellerId: nconf.get('AMAZON_PAYMENTS:SELLER_ID'),
  mwsAccessKey: nconf.get('AMAZON_PAYMENTS:MWS_KEY'),
  mwsSecretKey: nconf.get('AMAZON_PAYMENTS:MWS_SECRET'),
  clientId: nconf.get('AMAZON_PAYMENTS:CLIENT_ID'),
});

api.verifyAccessToken = function verifyAccessToken (req, res) {
  if (!req.body || !req.body.access_token) {
    return res.status(400).json({err: 'Access token not supplied.'});
  }

  amzPayment.api.getTokenInfo(req.body.access_token, function getTokenInfo (err) {
    if (err) return res.status(400).json({err});

    res.sendStatus(200);
  });
};

api.createOrderReferenceId = function createOrderReferenceId (req, res, next) {
  if (!req.body || !req.body.billingAgreementId) {
    return res.status(400).json({err: 'Billing Agreement Id not supplied.'});
  }

  amzPayment.offAmazonPayments.createOrderReferenceForId({
    Id: req.body.billingAgreementId,
    IdType: 'BillingAgreement',
    ConfirmNow: false,
  }, function createOrderReferenceForId (err, response) {
    if (err) return next(err);
    if (!response.OrderReferenceDetails || !response.OrderReferenceDetails.AmazonOrderReferenceId) {
      return next(new Error('Missing attributes in Amazon response.'));
    }

    res.json({
      orderReferenceId: response.OrderReferenceDetails.AmazonOrderReferenceId,
    });
  });
};

api.checkout = function checkout (req, res, next) {
  if (!req.body || !req.body.orderReferenceId) {
    return res.status(400).json({err: 'Billing Agreement Id not supplied.'});
  }

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

  async.series({
    setOrderReferenceDetails (cb) {
      amzPayment.offAmazonPayments.setOrderReferenceDetails({
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
      }, cb);
    },

    confirmOrderReference (cb) {
      amzPayment.offAmazonPayments.confirmOrderReference({
        AmazonOrderReferenceId: orderReferenceId,
      }, cb);
    },

    authorize (cb) {
      amzPayment.offAmazonPayments.authorize({
        AmazonOrderReferenceId: orderReferenceId,
        AuthorizationReferenceId: shared.uuid().substring(0, 32),
        AuthorizationAmount: {
          CurrencyCode: 'USD',
          Amount: amount,
        },
        SellerAuthorizationNote: 'HabitRPG Payment',
        TransactionTimeout: 0,
        CaptureNow: true,
      }, function checkAuthorizationStatus (err) {
        if (err) return cb(err);

        if (res.AuthorizationDetails.AuthorizationStatus.State === 'Declined') {
          return cb(new Error('The payment was not successfull.'));
        }

        return cb();
      });
    },

    closeOrderReference (cb) {
      amzPayment.offAmazonPayments.closeOrderReference({
        AmazonOrderReferenceId: orderReferenceId,
      }, cb);
    },

    executePayment (cb) {
      async.waterfall([
        function findUser (cb2) {
          User.findById(gift ? gift.uuid : undefined, cb2);
        },
        function executeAmazonPayment (member, cb2) {
          let data = {user, paymentMethod: 'Amazon Payments'};
          let method = 'buyGems';

          if (gift) {
            if (gift.type === 'subscription') method = 'createSubscription';
            gift.member = member;
            data.gift = gift;
            data.paymentMethod = 'Gift';
          }

          payments[method](data, cb2);
        },
      ], cb);
    },
  }, function result (err) {
    if (err) return next(err);

    res.sendStatus(200);
  });
};

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

module.exports = api;
