import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import superagent from 'superagent';
import nconf from 'nconf';

const API_TEST_SERVER_PORT = nconf.get('PORT');
describe('GET /qr-code/user/:memberId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('validates req.params.memberId', async () => {
    await expect(user.get('/qr-code/user/invalidUUID')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('redirects to profile page', async () => {
    let url = `http://localhost:${API_TEST_SERVER_PORT}/qr-code/user/${user._id}`;
    let response = await superagent.get(url).end(function (err, res) {
      expect(err).to.be(undefined);
      return res;
    });
    expect(response.status).to.eql(200);
    expect(response.request.url).to.eql(`http://localhost:${API_TEST_SERVER_PORT}/static/front/#?memberId=${user._id}`);
  });
});
