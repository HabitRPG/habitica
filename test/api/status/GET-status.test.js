import {requester} from '../../helpers/api.helper';

describe('Status', () => {
  let api;

  beforeEach(() => {
    api = requester();
  });

  it('returns a status of up when server is up', (done) => {
    api.get('/status')
      .then((res) => {
        expect(res.status).to.eql('up');
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
