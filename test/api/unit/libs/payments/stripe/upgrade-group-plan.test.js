import stripeModule from 'stripe';

import {
  generateGroup,
} from '../../../../../helpers/api-unit.helper';
import { model as User } from '../../../../../../website/server/models/user';
import { model as Group } from '../../../../../../website/server/models/group';
import stripePayments from '../../../../../../website/server/libs/payments/stripe';
import payments from '../../../../../../website/server/libs/payments/payments';

describe('Stripe - Upgrade Group Plan', () => {
  const stripe = stripeModule('test');
  let spy; let data; let user; let
    group;

  beforeEach(async () => {
    user = new User();
    user.profile.name = 'sender';

    data = {
      user,
      sub: {
        key: 'basic_3mo', // @TODO: Validate that this is group
      },
      customerId: 'customer-id',
      paymentMethod: 'Payment Method',
      headers: {
        'x-client': 'habitica-web',
        'user-agent': '',
      },
    };

    group = generateGroup({
      name: 'test group',
      type: 'guild',
      privacy: 'public',
      leader: user._id,
    });
    await group.save();

    spy = sinon.stub(stripe.subscriptions, 'update');
    spy.resolves([]);
    data.groupId = group._id;
    data.sub.quantity = 3;
    stripePayments.setStripeApi(stripe);
  });

  afterEach(() => {
    stripe.subscriptions.update.restore();
  });

  it('updates a group plan quantity', async () => {
    data.paymentMethod = 'Stripe';
    await payments.createSubscription(data);

    const updatedGroup = await Group.findById(group._id).exec();
    expect(updatedGroup.purchased.plan.quantity).to.eql(3);

    updatedGroup.memberCount += 1;
    await updatedGroup.save();

    await stripePayments.chargeForAdditionalGroupMember(updatedGroup);

    expect(spy.calledOnce).to.be.true;
    expect(updatedGroup.purchased.plan.quantity).to.eql(4);
  });
});
