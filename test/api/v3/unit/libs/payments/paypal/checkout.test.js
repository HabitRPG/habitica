/* eslint-disable camelcase */
import nconf from 'nconf';

import paypalPayments from '../../../../../../../website/server/libs/paypalPayments';
import { model as User } from '../../../../../../../website/server/models/user';
import common from '../../../../../../../website/common';

const BASE_URL = nconf.get('BASE_URL');
const i18n = common.i18n;

describe('checkout', () => {
  const subKey = 'basic_3mo';
  let paypalPaymentCreateStub;
  let approvalHerf;

  function getPaypalCreateOptions (description, amount) {
    return {
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
      .returnsPromise().resolves({
        links: [{ rel: 'approval_url', href: approvalHerf }],
      });
  });

  afterEach(() => {
    paypalPayments.paypalPaymentCreate.restore();
  });

  it('creates a link for gem purchases', async () => {
    let link = await paypalPayments.checkout({user: new User()});

    expect(paypalPaymentCreateStub).to.be.calledOnce;
    expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('Habitica Gems', 5.00));
    expect(link).to.eql(approvalHerf);
  });

  it('should error if gem amount is too low', async () => {
    let receivingUser = new User();
    receivingUser.save();
    let gift = {
      type: 'gems',
      gems: {
        amount: 0,
        uuid: receivingUser._id,
      },
    };

    await expect(paypalPayments.checkout({gift}))
    .to.eventually.be.rejected.and.to.eql({
      httpCode: 400,
      message: 'Amount must be at least 1.',
      name: 'BadRequest',
    });
  });

  it('should error if the user cannot get gems', async () => {
    let user = new User();
    sinon.stub(user, 'canGetGems').returnsPromise().resolves(false);

    await expect(paypalPayments.checkout({user})).to.eventually.be.rejected.and.to.eql({
      httpCode: 401,
      message: i18n.t('groupPolicyCannotGetGems'),
      name: 'NotAuthorized',
    });
  });

  it('creates a link for gifting gems', async () => {
    let receivingUser = new User();
    await receivingUser.save();
    let gift = {
      type: 'gems',
      uuid: receivingUser._id,
      gems: {
        amount: 16,
      },
    };

    let link = await paypalPayments.checkout({gift});

    expect(paypalPaymentCreateStub).to.be.calledOnce;
    expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('Habitica Gems (Gift)', '4.00'));
    expect(link).to.eql(approvalHerf);
  });

  it('creates a link for gifting a subscription', async () => {
    let receivingUser = new User();
    receivingUser.save();
    let gift = {
      type: 'subscription',
      subscription: {
        key: subKey,
        uuid: receivingUser._id,
      },
    };

    let link = await paypalPayments.checkout({gift});

    expect(paypalPaymentCreateStub).to.be.calledOnce;
    expect(paypalPaymentCreateStub).to.be.calledWith(getPaypalCreateOptions('mo. Habitica Subscription (Gift)', '15.00'));
    expect(link).to.eql(approvalHerf);
  });
});
