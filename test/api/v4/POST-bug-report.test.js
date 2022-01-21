import {
  generateUser,
} from '../../helpers/api-integration/v4';

describe('POST /bug-report', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error when message is not added', async () => {
    await expect(user.post('/bug-report', {
      message: '',
    }))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        // seems it is not possible to get the real error message
        message: 'Invalid request parameters.',
      });
  });

  it('returns an error when email is not added', async () => {
    await expect(user.post('/bug-report', {
      message: 'message',
      email: '',
    }))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        // seems it is not possible to get the real error message
        message: 'Invalid request parameters.',
      });
  });

  it('returns an error when email is not valid', async () => {
    await expect(user.post('/bug-report', {
      message: 'message',
      email: 'notamail',
    }))
      .to.eventually.be.rejected.and.to.eql({
        code: 400,
        error: 'BadRequest',
        // seems it is not possible to get the real error message
        message: 'Invalid request parameters.',
      });
  });
});
