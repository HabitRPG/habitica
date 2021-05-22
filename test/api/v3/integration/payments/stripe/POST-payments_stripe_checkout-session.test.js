import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';
import common from '../../../../../../website/common';

describe('payments - stripe - #createCheckoutSession', () => {
  const endpoint = '/stripe/checkout-session';
  let user; const groupId = 'groupId';
  const gift = {}; const subKey = 'basic_3mo';
  const gemsBlock = '21gems'; const coupon = 'coupon';
  let stripeCreateCheckoutSessionStub; const sessionId = 'sessionId';

  beforeEach(async () => {
    user = await generateUser();
    stripeCreateCheckoutSessionStub = sinon
      .stub(stripePayments, 'createCheckoutSession')
      .resolves({ id: sessionId });
  });

  afterEach(() => {
    stripePayments.createCheckoutSession.restore();
  });

  it('works', async () => {
    const res = await user.post(endpoint, {
      groupId,
      gift,
      sub: subKey,
      gemsBlock,
      coupon,
    });

    expect(res.sessionId).to.equal(sessionId);

    expect(stripeCreateCheckoutSessionStub).to.be.calledOnce;
    expect(stripeCreateCheckoutSessionStub.args[0][0].user._id).to.eql(user._id);
    expect(stripeCreateCheckoutSessionStub.args[0][0].groupId).to.eql(groupId);
    expect(stripeCreateCheckoutSessionStub.args[0][0].gift).to.eql(gift);
    expect(stripeCreateCheckoutSessionStub.args[0][0].sub)
      .to.eql(common.content.subscriptionBlocks[subKey]);
    expect(stripeCreateCheckoutSessionStub.args[0][0].gemsBlock).to.eql(gemsBlock);
    expect(stripeCreateCheckoutSessionStub.args[0][0].coupon).to.eql(coupon);
  });
});
