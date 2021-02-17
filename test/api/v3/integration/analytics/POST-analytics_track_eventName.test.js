import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration/v3';
import { mockAnalyticsService as analytics } from '../../../../../website/server/libs/analyticsService';

describe('POST /analytics/track/:eventName', () => {
  it('calls res.analytics', async () => {
    const user = await generateUser();
    sandbox.spy(analytics, 'track');

    const requestWithHeaders = requester(user, { 'x-client': 'habitica-web' });
    await requestWithHeaders.post('/analytics/track/eventName', { data: 'example' }, { 'x-client': 'habitica-web' });
    expect(analytics.track).to.be.calledOnce;
    expect(analytics.track).to.be.calledWith('eventName', sandbox.match({ data: 'example' }));

    sandbox.restore();
  });
});
