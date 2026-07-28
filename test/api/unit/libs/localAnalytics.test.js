import nconf from 'nconf';
import requireAgain from 'require-again';
import { model as User } from '../../../../website/server/models/user';
import { RegistrationEventModel } from '../../../../website/server/models/analytics/registrationEvent';
import { SubscriptionEventModel } from '../../../../website/server/models/analytics/subscriptionEvent';

describe('localAnalytics', () => {
  let user;
  let localAnalytics;
  before(() => {
    const nconfGetStub = sandbox.stub(nconf, 'get');
    nconfGetStub.withArgs('ANALYTICS_DB').returns('analytics');
    nconfGetStub.withArgs('DISABLE_LOCAL_ANALYTICS').returns(false);
    localAnalytics = requireAgain('../../../../website/server/libs/localAnalytics');
  });

  beforeEach(async () => {
    user = new User({
      auth: {
        local: {
          username: 'username',
          email: 'email@example.com',
        },
      },
      registeredThrough: 'habitica-web',
    });
  });

  describe('trackRegistrationEvent', () => {
    afterEach(async () => {
      await RegistrationEventModel.deleteMany({});
    });

    it('creates a registration event when a user registers', async () => {
      user._id = '00000000-0000-0000-0000-000000000001';
      await localAnalytics.trackRegistrationEvent({ user, ipAddress: '127.0.0.1' });

      const registrationEvents = await RegistrationEventModel.find({ userId: user._id });
      expect(registrationEvents).to.have.lengthOf(1);
      expect(registrationEvents[0]).to.have.property('userId', user._id);
      expect(registrationEvents[0]).to.have.property('ipAddress', '127.0.0.1');
    });

    it('saves the correct data to the database', async () => {
      user._id = '00000000-0000-0000-0000-000000000002';
      user.auth.google = { id: 'abc', emails: [{ value: 'email@example.com' }] };
      await localAnalytics.trackRegistrationEvent({ user, ipAddress: '127.0.0.2' });

      const registrationEvent = await RegistrationEventModel.findOne({ userId: user._id });
      expect(registrationEvent).to.have.property('userId', user._id);
      expect(registrationEvent).to.have.property('ipAddress', '127.0.0.2');
      expect(registrationEvent).to.have.property('authenticationMethod', 'google');
    });
  });

  describe('trackSubscriptionEvent', () => {
    afterEach(async () => {
      await SubscriptionEventModel.deleteMany({});
    });

    it('creates a subscription event when a user subscribes', async () => {
      user._id = '00000000-0000-0000-0000-000000000003';
      await localAnalytics.trackSubscriptionEvent({
        eventType: 'subscribed',
        user,
        paymentMethod: 'stripe',
        customerId: 'cus_123',
        planId: 'plan_123',
      });

      const subscriptionEvents = await SubscriptionEventModel.find({ userId: user._id });
      expect(subscriptionEvents).to.have.lengthOf(1);
      expect(subscriptionEvents[0]).to.have.property('userId', user._id);
      expect(subscriptionEvents[0]).to.have.property('eventType', 'subscribed');
      expect(subscriptionEvents[0]).to.have.property('paymentMethod', 'stripe');
      expect(subscriptionEvents[0]).to.have.property('customerId', 'cus_123');
      expect(subscriptionEvents[0]).to.have.property('planId', 'plan_123');
    });

    it('creates a subscription event with cancellation reason when a user cancels', async () => {
      user._id = '00000000-0000-0000-0000-000000000004';
      await localAnalytics.trackSubscriptionEvent({
        eventType: 'cancelled',
        user,
        paymentMethod: 'stripe',
        customerId: 'cus_456',
        planId: 'plan_456',
        cancellationReason: 'No longer needed',
      });

      const subscriptionEvent = await SubscriptionEventModel.findOne({ userId: user._id });
      expect(subscriptionEvent).to.have.property('userId', user._id);
      expect(subscriptionEvent).to.have.property('eventType', 'cancelled');
      expect(subscriptionEvent).to.have.property('paymentMethod', 'stripe');
      expect(subscriptionEvent).to.have.property('customerId', 'cus_456');
      expect(subscriptionEvent).to.have.property('planId', 'plan_456');
      expect(subscriptionEvent).to.have.property('cancellationReason', 'No longer needed');
    });
  });
});
