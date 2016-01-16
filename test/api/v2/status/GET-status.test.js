import {requester} from '../../../helpers/api-integration/v2';

describe('Status', () => {
  it('returns a status of up when server is up', async () => {
    let api = requester();

    await expect(api.get('/status')).to.eventually.eql({status: 'up'});
  });
});
