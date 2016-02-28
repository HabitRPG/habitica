import {
  generateUser,
} from '../../../../../helpers/api-integration/v3';
import moment from 'moment';

describe('POST /user/auth/firebase', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns a Firebase token', async () => {
    let {token, expires} = await user.post('/user/auth/firebase');
    expect(moment(expires).isValid()).to.be.true;
    expect(token).to.be.a('string');
  });
});
