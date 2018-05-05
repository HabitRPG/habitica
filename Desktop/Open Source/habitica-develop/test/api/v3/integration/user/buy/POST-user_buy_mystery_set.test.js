import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';

describe('POST /user/buy-mystery-set/:key', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'purchased.plan.consecutive.trinkets': 1,
    });
  });

  // More tests in common code unit tests

  it('returns an error if the mystery set is not found', async () => {
    await expect(user.post('/user/buy-mystery-set/notExisting'))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('mysterySetNotFound'),
      });
  });

  it('buys a mystery set', async () => {
    let key = 301404;

    let res = await user.post(`/user/buy-mystery-set/${key}`);
    await user.sync();

    expect(res.data).to.eql({
      items: JSON.parse(JSON.stringify(user.items)), // otherwise dates can't be compared
      purchasedPlanConsecutive: user.purchased.plan.consecutive,
    });
    expect(res.message).to.equal(t('hourglassPurchaseSet'));
  });
});
