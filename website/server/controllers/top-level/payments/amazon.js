import {
  BadRequest,
  NotAuthorized,
} from '../../../libs/errors';
import amzLib from '../../../libs/amazonPayments';
import {
  authWithHeaders,
  authWithUrl,
} from '../../../middlewares/auth';
import shared from '../../../../common';
import payments from '../../../libs/payments';
import moment from 'moment';
import { model as Coupon } from '../../../models/coupon';
import { model as User } from '../../../models/user';
import cc from 'coupon-code';

let api = {};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /amazon/verifyAccessToken Amazon Payments: verify access token
 * @apiName AmazonVerifyAccessToken
 * @apiGroup Payments
 *
 * @apiSuccess {Object} data Empty object
 **/
api.verifyAccessToken = {
  method: 'POST',
  url: '/amazon/verifyAccessToken',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let accessToken = req.body.access_token;

    if (!accessToken) throw new BadRequest('Missing req.body.access_token');

    await amzLib.getTokenInfo(accessToken);
    res.respond(200, {});
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /amazon/createOrderReferenceId Amazon Payments: create order reference id
 * @apiName AmazonCreateOrderReferenceId
 * @apiGroup Payments
 *
 * @apiSuccess {String} data.orderReferenceId The order reference id.
 **/
api.createOrderReferenceId = {
  method: 'POST',
  url: '/amazon/createOrderReferenceId',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let billingAgreementId = req.body.billingAgreementId;

    if (!billingAgreementId) throw new BadRequest('Missing req.body.billingAgreementId');

    let response = await amzLib.createOrderReferenceId({
      Id: billingAgreementId,
      IdType: 'BillingAgreement',
      ConfirmNow: false,
    });

    res.respond(200, {
      orderReferenceId: response.OrderReferenceDetails.AmazonOrderReferenceId,
    });
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /amazon/checkout Amazon Payments: checkout
 * @apiName AmazonCheckout
 * @apiGroup Payments
 *
 * @apiSuccess {Object} data Empty object
 **/
api.checkout = {
  method: 'POST',
  url: '/amazon/checkout',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let gift = req.body.gift;
    let user = res.locals.user;
    let orderReferenceId = req.body.orderReferenceId;
    let amount = 5;

    if (!orderReferenceId) throw new BadRequest('Missing req.body.orderReferenceId');

    if (gift) {
      if (gift.type === 'gems') {
        amount = gift.gems.amount / 4;
      } else if (gift.type === 'subscription') {
        amount = shared.content.subscriptionBlocks[gift.subscription.key].price;
      }
    }

    await amzLib.setOrderReferenceDetails({
      AmazonOrderReferenceId: orderReferenceId,
      OrderReferenceAttributes: {
        OrderTotal: {
          CurrencyCode: 'USD',
          Amount: amount,
        },
        SellerNote: 'Habitica Payment',
        SellerOrderAttributes: {
          SellerOrderId: shared.uuid(),
          StoreName: 'Habitica',
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
      SellerAuthorizationNote: 'Habitica Payment',
      TransactionTimeout: 0,
      CaptureNow: true,
    });

    await amzLib.closeOrderReference({ AmazonOrderReferenceId: orderReferenceId });

    // execute payment
    let method = 'buyGems';
    let data = {
      user,
      paymentMethod: 'Amazon Payments',
      headers: req.headers,
    };

    if (gift) {
      if (gift.type === 'subscription') method = 'createSubscription';
      gift.member = await User.findById(gift ? gift.uuid : undefined);
      data.gift = gift;
      data.paymentMethod = 'Gift';
    }

    await payments[method](data);

    res.respond(200);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {post} /amazon/subscribe Amazon Payments: subscribe
 * @apiName AmazonSubscribe
 * @apiGroup Payments
 *
 * @apiSuccess {Object} data Empty object
 **/
api.subscribe = {
  method: 'POST',
  url: '/amazon/subscribe',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    let billingAgreementId = req.body.billingAgreementId;
    let sub = req.body.subscription ? shared.content.subscriptionBlocks[req.body.subscription] : false;
    let coupon = req.body.coupon;
    let user = res.locals.user;

    if (!sub) throw new BadRequest(res.t('missingSubscriptionCode'));
    if (!billingAgreementId) throw new BadRequest('Missing req.body.billingAgreementId');

    if (sub.discount) { // apply discount
      if (!coupon) throw new BadRequest(res.t('couponCodeRequired'));
      let result = await Coupon.findOne({_id: cc.validate(coupon), event: sub.key});
      if (!result) throw new NotAuthorized(res.t('invalidCoupon'));
    }

    await amzLib.setBillingAgreementDetails({
      AmazonBillingAgreementId: billingAgreementId,
      BillingAgreementAttributes: {
        SellerNote: 'Habitica Subscription',
        SellerBillingAgreementAttributes: {
          SellerBillingAgreementId: shared.uuid(),
          StoreName: 'Habitica',
          CustomInformation: 'Habitica Subscription',
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
      SellerAuthorizationNote: 'Habitica Subscription Payment',
      TransactionTimeout: 0,
      CaptureNow: true,
      SellerNote: 'Habitica Subscription Payment',
      SellerOrderAttributes: {
        SellerOrderId: shared.uuid(),
        StoreName: 'Habitica',
      },
    });

    await payments.createSubscription({
      user,
      customerId: billingAgreementId,
      paymentMethod: 'Amazon Payments',
      sub,
      headers: req.headers,
    });

    res.respond(200);
  },
};

/**
 * @apiIgnore Payments are considered part of the private API
 * @api {get} /amazon/subscribe/cancel Amazon Payments: subscribe cancel
 * @apiName AmazonSubscribe
 * @apiGroup Payments
 **/
api.subscribeCancel = {
  method: 'GET',
  url: '/amazon/subscribe/cancel',
  middlewares: [authWithUrl],
  async handler (req, res) {
    let user = res.locals.user;
    let billingAgreementId = user.purchased.plan.customerId;

    if (!billingAgreementId) throw new NotAuthorized(res.t('missingSubscription'));

    let details = await amzLib.getBillingAgreementDetails({
      AmazonBillingAgreementId: billingAgreementId,
    });

    if (details.BillingAgreementDetails.BillingAgreementStatus.State !== 'Closed') {
      await amzLib.closeBillingAgreement({
        AmazonBillingAgreementId: billingAgreementId,
      });
    }

    let subscriptionBlock = shared.content.subscriptionBlocks[user.purchased.plan.planId];
    let subscriptionLength = subscriptionBlock.months * 30;

    await payments.cancelSubscription({
      user,
      nextBill: moment(user.purchased.plan.lastBillingDate).add({ days: subscriptionLength }),
      paymentMethod: 'Amazon Payments',
      headers: req.headers,
    });

    if (req.query.noRedirect) {
      res.respond(200);
    } else {
      res.redirect('/');
    }
  },
};

module.exports = api;
