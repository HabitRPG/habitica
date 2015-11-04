import {requester} from '../../../helpers/api-integration.helper';

describe('Status', () => {

  it('returns a status of up when server is up', () => {
    let api = requester();
    return expect(api.get('/status'))
      .to.eventually.eql({status: 'up'});
  });
});
