/* eslint-disable camelcase */
import moment from 'moment';
import cc from 'coupon-code';

import paypalPayments from '../../../../../../website/server/libs/payments/paypal';
import { model as Coupon } from '../../../../../../website/server/models/coupon';
import common from '../../../../../../website/common';

const { i18n } = common;

describe('paypal - subscribe', () => {
  const subKey = 'basic_3mo';
  let coupon; let sub; let
    approvalHerf;
  let paypalBillingAgreementCreateStub;

  beforeEach(() => {
    approvalHerf = 'approvalHerf-test';
    sub = { ...common.content.subscriptionBlocks[subKey] };

    paypalBillingAgreementCreateStub = sinon.stub(paypalPayments, 'paypalBillingAgreementCreate')
      .resolves({
        links: [{ rel: 'approval_url', href: approvalHerf }],
      });
  });

  afterEach(() => {
    paypalPayments.paypalBillingAgreementCreate.restore();
  });

  it('should throw an error when coupon code is missing', async () => {
    sub.discount = 40;

    await expect(paypalPayments.subscribe({ sub, coupon }))
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

    const couponModel = new Coupon();
    couponModel.event = 'google_6mo';
    await couponModel.save();

    sinon.stub(cc, 'validate').returns('invalid');

    await expect(paypalPayments.subscribe({ sub, coupon }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        name: 'NotAuthorized',
        message: i18n.t('invalidCoupon'),
      });
    cc.validate.restore();
  });

  it('subscribes with paypal with a coupon', async () => {
    sub.discount = 40;
    sub.key = 'google_6mo';
    coupon = 'example-coupon';

    const couponModel = new Coupon();
    couponModel.event = 'google_6mo';
    const updatedCouponModel = await couponModel.save();

    sinon.stub(cc, 'validate').returns(updatedCouponModel._id);

    const link = await paypalPayments.subscribe({ sub, coupon });

    expect(link).to.eql(approvalHerf);
    expect(paypalBillingAgreementCreateStub).to.be.calledOnce;
    const billingPlanTitle = `Habitica Subscription ($${sub.price} every ${sub.months} months, recurring)`;
    expect(paypalBillingAgreementCreateStub).to.be.calledWith({
      name: billingPlanTitle,
      description: billingPlanTitle,
      start_date: moment().add({ minutes: 5 }).format(),
      plan: {
        id: sub.paypalKey,
      },
      payer: {
        payment_method: 'Paypal',
      },
    });

    cc.validate.restore();
  });

  it('creates a link for a subscription', async () => {
    delete sub.discount;

    const link = await paypalPayments.subscribe({ sub, coupon });

    expect(link).to.eql(approvalHerf);
    expect(paypalBillingAgreementCreateStub).to.be.calledOnce;
    const billingPlanTitle = `Habitica Subscription ($${sub.price} every ${sub.months} months, recurring)`;
    expect(paypalBillingAgreementCreateStub).to.be.calledWith({
      name: billingPlanTitle,
      description: billingPlanTitle,
      start_date: moment().add({ minutes: 5 }).format(),
      plan: {
        id: sub.paypalKey,
      },
      payer: {
        payment_method: 'Paypal',
      },
    });
  });
});
