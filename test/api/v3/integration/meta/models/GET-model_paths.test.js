import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('GET /meta/models/:model/paths', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('returns an error when model is not accessible or doesn\'t exists', async () => {
    await expect(user.get('/meta/models/1234/paths')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  let models = ['habit', 'daily', 'todo', 'reward', 'user', 'tag', 'challenge', 'group'];
  models.forEach(model => {
    it(`returns the model paths for ${model}`, async () => {
      let res = await user.get(`/meta/models/${model}/paths`);

      expect(res._id).to.equal('String');
      expect(res).to.not.have.keys('__v');
    });
  });
});
