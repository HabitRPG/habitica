import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';

describe('payments - stripe - #handleWebhooks', () => {
  const endpoint = '/stripe/webhooks';
  let user; const body = '{"key": "val"}';
  let stripeHandleWebhooksStub;

  beforeEach(async () => {
    user = await generateUser();
    stripeHandleWebhooksStub = sinon
      .stub(stripePayments, 'handleWebhooks')
      .resolves({});
  });

  afterEach(() => {
    stripePayments.handleWebhooks.restore();
  });

  it('works', async () => {
    const res = await user.post(endpoint, body);
    expect(res).to.eql({});

    expect(stripeHandleWebhooksStub).to.be.calledOnce;
    expect(stripeHandleWebhooksStub.args[0][0].body).to.exist;
    expect(stripeHandleWebhooksStub.args[0][0].headers).to.exist;
  });
});
