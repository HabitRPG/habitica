import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { mockAnalyticsService as analytics } from '../../../../../website/server/libs/analyticsService';

describe('POST /analytics/track/:eventName', () => {
  it('requires authentication', async () => {
    await expect(requester().post('/analytics/track/event')).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingAuthHeaders'),
    });
  });

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
