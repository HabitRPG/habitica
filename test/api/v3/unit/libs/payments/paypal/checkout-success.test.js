/* eslint-disable camelcase */
import nconf from 'nconf';
import moment from 'moment';
import cc from 'coupon-code';

import payments from '../../../../../../../website/server/libs/payments';
import paypalPayments from '../../../../../../../website/server/libs/paypalPayments';
import {
  generateGroup,
} from '../../../../../../helpers/api-unit.helper.js';
import { model as User } from '../../../../../../../website/server/models/user';
import { model as Coupon } from '../../../../../../../website/server/models/coupon';
import common from '../../../../../../../website/common';
import { createNonLeaderGroupMember } from '../paymentHelpers';

const BASE_URL = nconf.get('BASE_URL');
const i18n = common.i18n;

describe('checkout success', () => {
  const subKey = 'basic_3mo';
  let user, gift, customerId, paymentId;
  let paypalPaymentExecuteStub, paymentBuyGemsStub, paymentsCreateSubscritionStub;

  beforeEach(() => {
    user = new User();
    customerId = 'customerId-test';
    paymentId = 'paymentId-test';

    paypalPaymentExecuteStub = sinon.stub(paypalPayments, 'paypalPaymentExecute').returnsPromise().resolves({});
    paymentBuyGemsStub = sinon.stub(payments, 'buyGems').returnsPromise().resolves({});
    paymentsCreateSubscritionStub = sinon.stub(payments, 'createSubscription').returnsPromise().resolves({});
  });

  afterEach(() => {
    paypalPayments.paypalPaymentExecute.restore();
    payments.buyGems.restore();
    payments.createSubscription.restore();
  });

  it('purchases gems', async () => {
    await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

    expect(paypalPaymentExecuteStub).to.be.calledOnce;
    expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
    expect(paymentBuyGemsStub).to.be.calledOnce;
    expect(paymentBuyGemsStub).to.be.calledWith({
      user,
      customerId,
      paymentMethod: 'Paypal',
    });
  });

  it('gifts gems', async () => {
    let receivingUser = new User();
    await receivingUser.save();
    gift = {
      type: 'gems',
      gems: {
        amount: 16,
        uuid: receivingUser._id,
      },
    };

    await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

    expect(paypalPaymentExecuteStub).to.be.calledOnce;
    expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
    expect(paymentBuyGemsStub).to.be.calledOnce;
    expect(paymentBuyGemsStub).to.be.calledWith({
      user,
      customerId,
      paymentMethod: 'PayPal (Gift)',
      gift,
    });
  });

  it('gifts subscription', async () => {
    let receivingUser = new User();
    await receivingUser.save();
    gift = {
      type: 'subscription',
      subscription: {
        key: subKey,
        uuid: receivingUser._id,
      },
    };

    await paypalPayments.checkoutSuccess({user, gift, paymentId, customerId});

    expect(paypalPaymentExecuteStub).to.be.calledOnce;
    expect(paypalPaymentExecuteStub).to.be.calledWith(paymentId, { payer_id: customerId });
    expect(paymentsCreateSubscritionStub).to.be.calledOnce;
    expect(paymentsCreateSubscritionStub).to.be.calledWith({
      user,
      customerId,
      paymentMethod: 'PayPal (Gift)',
      gift,
    });
  });
});
