import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import content from '../../../../../website/common/script/content/index';

describe('POST /user/release-mounts', () => {
  let user;
  const animal = 'Wolf-Base';

  const loadMounts = () => {
    const mounts = {};
    Object.keys(content.pets).forEach(m => {
      mounts[m] = content.pets[m];
      mounts[m] = true;
    });
    return mounts;
  };

  beforeEach(async () => {
    user = await generateUser({
      'items.currentMount': animal,
      'items.mounts': loadMounts(),
    });
  });

  it('returns an error when user balance is too low', async () => {
    await expect(user.post('/user/release-mounts'))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughGems'),
      });
  });

  // More tests in common code unit tests

  it('releases mounts', async () => {
    await user.update({
      balance: 1,
    });

    const response = await user.post('/user/release-mounts');
    await user.sync();

    expect(response.message).to.equal(t('mountsReleased'));
    expect(user.balance).to.equal(0);
    expect(user.items.currentMount).to.be.empty;
    expect(user.items.mounts[animal]).to.equal(null);
    expect(user.achievements.mountMasterCount).to.equal(1);
  });
});
