import cc from 'coupon-code';

import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';
import { model as Coupon } from '../../../../../../../website/server/models/coupon';
import amzLib from '../../../../../../../website/server/libs/amazonPayments';
import payments from '../../../../../../../website/server/libs/payments';
import common from '../../../../../../../website/common';

const i18n = common.i18n;

describe('Amazon Payments - Subscribe', () => {
  const subKey = 'basic_3mo';
  let user, group, amount, billingAgreementId, sub, coupon, groupId, headers;
  let amazonSetBillingAgreementDetailsSpy;
  let amazonConfirmBillingAgreementSpy;
  let amazonAuthorizeOnBillingAgreementSpy;
  let createSubSpy;

  beforeEach(async () => {
    user = new User();
    user.profile.name = 'sender';
    user.purchased.plan.customerId = 'customer-id';
    user.purchased.plan.planId = subKey;
    user.purchased.plan.lastBillingDate = new Date();

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    group.purchased.plan.customerId = 'customer-id';
    group.purchased.plan.planId = subKey;
    await group.save();

    amount = common.content.subscriptionBlocks[subKey].price;
    billingAgreementId = 'billingAgreementId';
    sub = {
      key: subKey,
      price: amount,
    };
    groupId = group._id;
    headers = {};

    amazonSetBillingAgreementDetailsSpy = sinon.stub(amzLib, 'setBillingAgreementDetails');
    amazonSetBillingAgreementDetailsSpy.returnsPromise().resolves({});

    amazonConfirmBillingAgreementSpy = sinon.stub(amzLib, 'confirmBillingAgreement');
    amazonConfirmBillingAgreementSpy.returnsPromise().resolves({});

    amazonAuthorizeOnBillingAgreementSpy = sinon.stub(amzLib, 'authorizeOnBillingAgreement');
    amazonAuthorizeOnBillingAgreementSpy.returnsPromise().resolves({});

    createSubSpy = sinon.stub(payments, 'createSubscription');
    createSubSpy.returnsPromise().resolves({});

    sinon.stub(common, 'uuid').returns('uuid-generated');
  });

  afterEach(function () {
    amzLib.setBillingAgreementDetails.restore();
    amzLib.confirmBillingAgreement.restore();
    amzLib.authorizeOnBillingAgreement.restore();
    payments.createSubscription.restore();
    common.uuid.restore();
  });

  function expectAmazonAuthorizeBillingAgreementSpy () {
    expect(amazonAuthorizeOnBillingAgreementSpy).to.be.calledOnce;
    expect(amazonAuthorizeOnBillingAgreementSpy).to.be.calledWith({
      AmazonBillingAgreementId: billingAgreementId,
      AuthorizationReferenceId: common.uuid().substring(0, 32),
      AuthorizationAmount: {
        CurrencyCode: amzLib.constants.CURRENCY_CODE,
        Amount: amount,
      },
      SellerAuthorizationNote: amzLib.constants.SELLER_NOTE_ATHORIZATION_SUBSCRIPTION,
      TransactionTimeout: 0,
      CaptureNow: true,
      SellerNote: amzLib.constants.SELLER_NOTE_ATHORIZATION_SUBSCRIPTION,
      SellerOrderAttributes: {
        SellerOrderId: common.uuid(),
        StoreName: amzLib.constants.STORE_NAME,
      },
    });
  }

  function expectAmazonSetBillingAgreementDetailsSpy () {
    expect(amazonSetBillingAgreementDetailsSpy).to.be.calledOnce;
    expect(amazonSetBillingAgreementDetailsSpy).to.be.calledWith({
      AmazonBillingAgreementId: billingAgreementId,
      BillingAgreementAttributes: {
        SellerNote: amzLib.constants.SELLER_NOTE_SUBSCRIPTION,
        SellerBillingAgreementAttributes: {
          SellerBillingAgreementId: common.uuid(),
          StoreName: amzLib.constants.STORE_NAME,
          CustomInformation: amzLib.constants.SELLER_NOTE_SUBSCRIPTION,
        },
      },
    });
  }

  function expectCreateSpy () {
    expect(createSubSpy).to.be.calledOnce;
    expect(createSubSpy).to.be.calledWith({
      user,
      customerId: billingAgreementId,
      paymentMethod: amzLib.constants.PAYMENT_METHOD,
      sub,
      headers,
      groupId,
    });
  }

  it('should throw an error if we are missing a subscription', async () => {
    await expect(amzLib.subscribe({
      billingAgreementId,
      coupon,
      user,
      groupId,
      headers,
    }))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      name: 'BadRequest',
      message: i18n.t('missingSubscriptionCode'),
    });
  });

  it('should throw an error if we are missing a billingAgreementId', async () => {
    await expect(amzLib.subscribe({
      sub,
      coupon,
      user,
      groupId,
      headers,
    }))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      name: 'BadRequest',
      message: 'Missing req.body.billingAgreementId',
    });
  });

  it('should throw an error when coupon code is missing', async () => {
    sub.discount = 40;

    await expect(amzLib.subscribe({
      billingAgreementId,
      sub,
      coupon,
      user,
      groupId,
      headers,
    }))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      name: 'BadRequest',
      message: i18n.t('couponCodeRequired'),
    });
  });

  it('should throw an error when coupon code is invalid', async () => {
    sub.discount = 40;
    sub.key = 'google_6mo';
    coupon = 'example-coupon';

    let couponModel = new Coupon();
    couponModel.event = 'google_6mo';
    await couponModel.save();

    sinon.stub(cc, 'validate').returns('invalid');

    await expect(amzLib.subscribe({
      billingAgreementId,
      sub,
      coupon,
      user,
      groupId,
      headers,
    }))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 401,
      name: 'NotAuthorized',
      message: i18n.t('invalidCoupon'),
    });
    cc.validate.restore();
  });

  it('subscribes with amazon with a coupon', async () => {
    sub.discount = 40;
    sub.key = 'google_6mo';
    coupon = 'example-coupon';

    let couponModel = new Coupon();
    couponModel.event = 'google_6mo';
    let updatedCouponModel = await couponModel.save();

    sinon.stub(cc, 'validate').returns(updatedCouponModel._id);

    await amzLib.subscribe({
      billingAgreementId,
      sub,
      coupon,
      user,
      groupId,
      headers,
    });

    expectCreateSpy();

    cc.validate.restore();
  });

  it('subscribes with amazon', async () => {
    await amzLib.subscribe({
      billingAgreementId,
      sub,
      coupon,
      user,
      groupId,
      headers,
    });

    expectAmazonSetBillingAgreementDetailsSpy();

    expect(amazonConfirmBillingAgreementSpy).to.be.calledOnce;
    expect(amazonConfirmBillingAgreementSpy).to.be.calledWith({
      AmazonBillingAgreementId: billingAgreementId,
    });

    expectAmazonAuthorizeBillingAgreementSpy();

    expectCreateSpy();
  });

  it('subscribes with amazon with price to existing users', async () => {
    user = new User();
    user.guilds.push(groupId);
    await user.save();
    group.memberCount = 2;
    await group.save();
    sub.key = 'group_monthly';
    sub.price = 9;
    amount = 12;

    await amzLib.subscribe({
      billingAgreementId,
      sub,
      coupon,
      user,
      groupId,
      headers,
    });

    expectAmazonSetBillingAgreementDetailsSpy();
    expect(amazonConfirmBillingAgreementSpy).to.be.calledOnce;
    expect(amazonConfirmBillingAgreementSpy).to.be.calledWith({
      AmazonBillingAgreementId: billingAgreementId,
    });
    expectAmazonAuthorizeBillingAgreementSpy();
    expectCreateSpy();
  });
});
