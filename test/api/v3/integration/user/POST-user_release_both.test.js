import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import content from '../../../../../website/common/script/content/index';

describe('POST /user/release-both', () => {
  let user;
  const animal = 'Wolf-Base';
  const loadPets = () => {
    const pets = {};
    Object.keys(content.pets).forEach(p => {
      pets[p] = content.pets[p];
      pets[p] = 5;
    });
    return pets;
  };
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
      'items.currentPet': animal,
      'items.pets': loadPets(),
      'items.mounts': loadMounts(),
      'achievements.triadBingo': true,
    });
  });

  // @TODO: Traid is now free. Add this back if we need
  xit('returns an error when user balance is too low and user does not have triadBingo', async () => {
    await expect(user.post('/user/release-both'))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughGems'),
      });
  });

  // More tests in common code unit tests

  it('grants triad bingo with gems', async () => {
    await user.update();

    const response = await user.post('/user/release-both');
    await user.sync();

    expect(response.message).to.equal(t('mountsAndPetsReleased'));
    expect(user.balance).to.equal(0);
    expect(user.items.currentMount).to.equal('');
    expect(user.items.currentPet).to.equal('');
    expect(user.items.pets[animal]).to.equal(0);
    expect(user.items.mounts[animal]).to.equal(null);
    expect(user.achievements.beastMasterCount).to.equal(1);
    expect(user.achievements.mountMasterCount).to.equal(1);
    expect(user.achievements.triadBingoCount).to.equal(1);
  });
});
