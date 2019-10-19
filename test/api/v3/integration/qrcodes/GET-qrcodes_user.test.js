import superagent from 'superagent';
import nconf from 'nconf';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

const API_TEST_SERVER_PORT = nconf.get('PORT');
xdescribe('GET /qr-code/user/:memberId', () => {
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
    const url = `http://localhost:${API_TEST_SERVER_PORT}/qr-code/user/${user._id}`;
    const response = await superagent.get(url).end((err, res) => {
      expect(err).to.be(undefined);
      return res;
    });
    expect(response.status).to.eql(200);
    expect(response.request.url).to.eql(`http://localhost:${API_TEST_SERVER_PORT}/static/front/#?memberId=${user._id}`);
  });
});
