/*
import mongoose from 'mongoose';
import { model as User } from '../../../models/user'; */
import {
  BadRequest,
} from '../../../libs/api-v3/errors';
import amzLib from '../../../libs/api-v3/amazonPayments';
import { authWithHeaders } from '../../../middlewares/api-v3/auth';
import shared from '../../../../../common';
import payments from '../../../libs/api-v3/payments';
import moment from 'moment';
import { model as Coupon } from '../../../models/coupon';
import cc from 'coupon-code';

let api = {};

/**
 * @api {post} /api/v3/payments/amazon/verifyAccessToken verify access token
 * @apiVersion 3.0.0
 * @apiName AmazonVerifyAccessToken
 * @apiGroup Payments
 *
 * @apiParam {string} access_token the access token
 *
 * @apiSuccess {} empty
 **/
api.verifyAccessToken = {
  method: 'POST',
  url: '/payments/amazon/verifyAccessToken',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    try {
      await amzLib.getTokenInfo(req.body.access_token);
      res.respond(200, {});
    } catch (error) {
      throw new BadRequest(error.body.error_description);
    };
  },
};

/**
 * @api {post} /api/v3/payments/amazon/createOrderReferenceId create order reference id
 * @apiVersion 3.0.0
 * @apiName AmazonCreateOrderReferenceId
 * @apiGroup Payments
 *
 * @apiParam {string} billingAgreementId billing agreement id
 *
 * @apiSuccess {object} data.orderReferenceId The order reference id.
 **/
api.createOrderReferenceId = {
  method: 'POST',
  url: '/payments/amazon/createOrderReferenceId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    try {
      let response = await amzLib.createOrderReferenceId({
        Id: req.body.billingAgreementId,
        IdType: 'BillingAgreement',
        ConfirmNow: false,
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
 *
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
      let method = 'buyGems';
      let data = { user, paymentMethod: 'Amazon Payments' };
      if (gift) {
        if (gift.type === 'subscription') method = 'createSubscription';
        gift.member = await User.findById(gift ? gift.uuid : undefined);
        data.gift = gift;
        data.paymentMethod = 'Gift';
      }
      await payments[method](data);

      res.respond(200);
    } catch(error) {
      throw new BadRequest(error);
    }
  },
};

/**
 * @api {post} /api/v3/payments/amazon/subscribe Subscribe
 * @apiVersion 3.0.0
 * @apiName AmazonSubscribe
 * @apiGroup Payments
 *
 * @apiParam {string} billingAgreementId billing agreement id
 * @apiParam {string} subscription Subscription plan
 * @apiParam {string} coupon Coupon
 *
 * @apiSuccess {object} data.orderReferenceId The order reference id.
 **/
api.subscribe = {
  method: 'POST',
  url: '/payments/amazon/subscribe',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let billingAgreementId = req.body.billingAgreementId;
    let sub = req.body.subscription ? shared.content.subscriptionBlocks[req.body.subscription] : false;
    let coupon = req.body.coupon;
    let user = res.locals.user;

    if (!sub) {
      throw new BadRequest(res.t('missingSubscriptionCode'));
    }

    try {
      if (sub.discount) { // apply discount
        if (!coupon) throw new BadRequest(res.t('couponCodeRequired'));
        let result = await Coupon.findOne({_id: cc.validate(coupon), event: sub.key});
        if (!result) throw new BadRequest(res.t('invalidCoupon'));
      }

      await amzLib.setBillingAgreementDetails({
        AmazonBillingAgreementId: billingAgreementId,
        BillingAgreementAttributes: {
          SellerNote: 'HabitRPG Subscription',
          SellerBillingAgreementAttributes: {
            SellerBillingAgreementId: shared.uuid(),
            StoreName: 'HabitRPG',
            CustomInformation: 'HabitRPG Subscription',
          },
        },
      });

      await amzLib.confirmBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId,
      });

      await amzLib.authorizeOnBillingAgreement({
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
      });

      await payments.createSubscription({
        user,
        customerId: billingAgreementId,
        paymentMethod: 'Amazon Payments',
        sub,
      });

      res.respond(200);
    } catch (error) {
      throw new BadRequest(error);
    }
  },
};

/**
 * @api {get} /api/v3/payments/amazon/subscribeCancel SubscribeCancel
 * @apiVersion 3.0.0
 * @apiName AmazonSubscribe
 * @apiGroup Payments
 *
 * @apiSuccess {object} empty object
 **/
api.subscribeCancel = {
  method: 'GET',
  url: '/payments/amazon/subscribeCancel',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let user = res.locals.user;
    let billingAgreementId = user.purchased.plan.customerId;

    if (!user.purchased.plan.customerId) throw new BadRequest(res.t('missingSubscription'));

    try {
      await amzLib.closeBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId,
      });

      let data = {
        user,
        nextBill: moment(user.purchased.plan.lastBillingDate).add({ days: 30 }),
        paymentMethod: 'Amazon Payments',
      };
      await payments.cancelSubscription(data);

      res.respond(200, {});
    } catch (error) {
      throw new BadRequest(error.message);
    }
  },
};

module.exports = api;
