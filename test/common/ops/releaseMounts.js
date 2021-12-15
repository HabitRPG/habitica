import releaseMounts from '../../../website/common/script/ops/releaseMounts';
import content from '../../../website/common/script/content/index';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';

describe('shared.ops.releaseMounts', () => {
  let user;
  const animal = 'Wolf-Base';

  beforeEach(() => {
    user = generateUser();
    Object.keys(content.pets).forEach(k => {
      user.items.mounts[k] = content.pets[k];
      user.items.mounts[k] = true;
    });

    user.items.currentMount = animal;
    user.balance = 1;
  });

  it('returns an error when user balance is too low', async () => {
    user.balance = 0;

    try {
      await releaseMounts(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
    }
  });

  it('returns an error when user does not have all pets', async () => {
    const mountsKeys = Object.keys(user.items.mounts);
    delete user.items.mounts[mountsKeys[0]];

    try {
      await releaseMounts(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughMounts'));
    }
  });

  it('releases mounts', async () => {
    const result = await releaseMounts(user);

    expect(result[1]).to.equal(i18n.t('mountsReleased'));
    expect(user.items.mounts[animal]).to.equal(null);
  });

  it('removes drop currentMount', async () => {
    const mountInfo = content.mountInfo[user.items.currentMount];
    expect(mountInfo.type).to.equal('drop');
    await releaseMounts(user);

    expect(user.items.currentMount).to.be.empty;
  });

  it('leaves non-drop mount equipped', async () => {
    const questAnimal = 'Gryphon-Base';
    user.items.currentMount = questAnimal;
    user.items.mounts[questAnimal] = true;

    const mountInfo = content.mountInfo[user.items.currentMount];
    expect(mountInfo.type).to.not.equal('drop');
    await releaseMounts(user);

    expect(user.items.currentMount).to.equal(questAnimal);
  });

  it('increases mountMasterCount achievement', async () => {
    await releaseMounts(user);
    expect(user.achievements.mountMasterCount).to.equal(1);
  });

  it('does not increase mountMasterCount achievement if mount is missing (null)', async () => {
    const mountMasterCountBeforeRelease = user.achievements.mountMasterCount;
    user.items.mounts[animal] = null;

    try {
      await releaseMounts(user);
    } catch (e) {
      expect(user.achievements.mountMasterCount).to.equal(mountMasterCountBeforeRelease);
    }
  });

  it('does not increase mountMasterCount achievement if mount is missing (undefined)', async () => {
    const mountMasterCountBeforeRelease = user.achievements.mountMasterCount;
    delete user.items.mounts[animal];

    try {
      await releaseMounts(user);
    } catch (e) {
      expect(user.achievements.mountMasterCount).to.equal(mountMasterCountBeforeRelease);
    }
  });

  it('subtracts gems from balance', async () => {
    await releaseMounts(user);

    expect(user.balance).to.equal(0);
  });
});
