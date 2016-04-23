import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('payments - amazon - #checkout', () => {
  let endpoint = '/payments/amazon/checkout';
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('success', async (done) => {
    try {
      await user.post(endpoint);
    } catch (e) {
      done();
    }
  });

  it('applies gift');
});
