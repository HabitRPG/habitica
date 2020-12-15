/* eslint-disable camelcase */
import nconf from 'nconf';

import paypalPayments from '../../../../../../website/server/libs/payments/paypal';
import { model as User } from '../../../../../../website/server/models/user';
import common from '../../../../../../website/common';
import apiError from '../../../../../../website/server/libs/apiError';
import * as gems from '../../../../../../website/server/libs/payments/gems';

const BASE_URL = nconf.get('BASE_URL');
const { i18n } = common;

describe('paypal - checkout', () => {
  const subKey = 'basic_3mo';
  const gemsBlockKey = '21gems';
  let paypalPaymentCreateStub;
  let approvalHerf;

  function getPaypalCreateOptions (description, amount) {
    return {
      experience_profile_id: 'xp_profile_id',
      intent: 'sale',
      payer: { payment_method: 'Paypal' },
      redirect_urls: {
        return_url: `${BASE_URL}/paypal/checkout/success`,
        cancel_url: `${BASE_URL}`,
      },
      transactions: [{
        item_list: {
          items: [{
            name: description,
            price: amount,
            currency: 'USD',
            quantity: 1,
          }],
        },
        amount: {
          currency: 'USD',
          total: amount,
        },
        description,
      }],
    };
  }

  beforeEach(() => {
    approvalHerf = 'approval_href';
    paypalPaymentCreateStub = sinon.stub(paypalPayments, 'paypalPaymentCreate')
      .resolves({
        links: [{ rel: 'approval_url', href: approvalHerf }],
      });
    sandbox.stub(gems, 'validateGiftMessage');
  });

  afterEach(() => {
    paypalPayments.paypalPaymentCreate.restore();
  });

  it('creates a link for gem purchases', async () => {
    const link = await paypalPayments.checkout({ user: new User(), gemsBlock: gemsBlockKey });

    expect(gems.validateGiftMessage).to.not.be.called;
    expect(paypalPaymentCreateStub).to.be.calledOnce;
    expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('Habitica Gems', 4.99));
    expect(link).to.eql(approvalHerf);
  });

  it('should error if gem amount is too low', async () => {
    const receivingUser = new User();
    receivingUser.save();
    const gift = {
      type: 'gems',
      gems: {
        amount: 0,
        uuid: receivingUser._id,
      },
    };

    await expect(paypalPayments.checkout({ gift }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        message: 'Amount must be at least 1.',
        name: 'BadRequest',
      });
  });

  it('should error if the user cannot get gems', async () => {
    const user = new User();
    sinon.stub(user, 'canGetGems').resolves(false);

    await expect(paypalPayments.checkout({ user, gemsBlock: gemsBlockKey }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 401,
        message: i18n.t('groupPolicyCannotGetGems'),
        name: 'NotAuthorized',
      });
  });

  it('should error if the gems block is not valid', async () => {
    const user = new User();

    await expect(paypalPayments.checkout({ user, gemsBlock: 'invalid' }))
      .to.eventually.be.rejected.and.to.eql({
        httpCode: 400,
        message: apiError('invalidGemsBlock'),
        name: 'BadRequest',
      });
  });

  it('creates a link for gifting gems', async () => {
    const user = new User();
    const receivingUser = new User();
    await receivingUser.save();
    const gift = {
      type: 'gems',
      uuid: receivingUser._id,
      gems: {
        amount: 16,
      },
    };

    const link = await paypalPayments.checkout({ user, gift });

    expect(gems.validateGiftMessage).to.be.calledOnce;
    expect(gems.validateGiftMessage).to.be.calledWith(gift, user);
    expect(paypalPaymentCreateStub).to.be.calledOnce;
    expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('Habitica Gems (Gift)', '4.00'));
    expect(link).to.eql(approvalHerf);
  });

  it('creates a link for gifting a subscription', async () => {
    const user = new User();
    const receivingUser = new User();
    receivingUser.save();
    const gift = {
      type: 'subscription',
      subscription: {
        key: subKey,
        uuid: receivingUser._id,
      },
    };

    const link = await paypalPayments.checkout({ user, gift });

    expect(gems.validateGiftMessage).to.be.calledOnce;
    expect(gems.validateGiftMessage).to.be.calledWith(gift, user);

    expect(paypalPaymentCreateStub).to.be.calledOnce;
    expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('mo. Habitica Subscription (Gift)', '15.00'));
    expect(link).to.eql(approvalHerf);
  });
});
