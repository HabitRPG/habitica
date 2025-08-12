import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';

describe('payments - stripe - #subscribeEdit', () => {
  const endpoint = '/stripe/subscribe/edit';
  let user; const groupId = 'groupId';
  let stripeEditSubscriptionStub;
  const sessionId = 'sessionId';

  beforeEach(async () => {
    user = await generateUser();
    stripeEditSubscriptionStub = sinon
      .stub(stripePayments, 'createEditCardCheckoutSession')
      .resolves({ id: sessionId });
  });

  afterEach(() => {
    stripePayments.createEditCardCheckoutSession.restore();
  });

  it('works', async () => {
    const res = await user.post(endpoint, { groupId });
    expect(res.sessionId).to.equal(sessionId);

    expect(stripeEditSubscriptionStub).to.be.calledOnce;
    expect(stripeEditSubscriptionStub.args[0][0].user._id).to.eql(user._id);
    expect(stripeEditSubscriptionStub.args[0][0].groupId).to.eql(groupId);
  });
});
