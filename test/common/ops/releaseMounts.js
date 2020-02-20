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

  it('returns an error when user balance is too low', done => {
    user.balance = 0;

    try {
      releaseMounts(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('returns an error when user does not have all pets', done => {
    const mountsKeys = Object.keys(user.items.mounts);
    delete user.items.mounts[mountsKeys[0]];

    try {
      releaseMounts(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughMounts'));
      done();
    }
  });

  it('releases mounts', () => {
    const message = releaseMounts(user)[1];

    expect(message).to.equal(i18n.t('mountsReleased'));
    expect(user.items.mounts[animal]).to.equal(null);
  });

  it('removes drop currentMount', () => {
    const mountInfo = content.mountInfo[user.items.currentMount];
    expect(mountInfo.type).to.equal('drop');
    releaseMounts(user);

    expect(user.items.currentMount).to.be.empty;
  });

  it('leaves non-drop mount equipped', () => {
    const questAnimal = 'Gryphon-Base';
    user.items.currentMount = questAnimal;
    user.items.mounts[questAnimal] = true;

    const mountInfo = content.mountInfo[user.items.currentMount];
    expect(mountInfo.type).to.not.equal('drop');
    releaseMounts(user);

    expect(user.items.currentMount).to.equal(questAnimal);
  });

  it('increases mountMasterCount achievement', () => {
    releaseMounts(user);
    expect(user.achievements.mountMasterCount).to.equal(1);
  });

  it('does not increase mountMasterCount achievement if mount is missing (null)', () => {
    const mountMasterCountBeforeRelease = user.achievements.mountMasterCount;
    user.items.mounts[animal] = null;

    try {
      releaseMounts(user);
    } catch (e) {
      expect(user.achievements.mountMasterCount).to.equal(mountMasterCountBeforeRelease);
    }
  });

  it('does not increase mountMasterCount achievement if mount is missing (undefined)', () => {
    const mountMasterCountBeforeRelease = user.achievements.mountMasterCount;
    delete user.items.mounts[animal];

    try {
      releaseMounts(user);
    } catch (e) {
      expect(user.achievements.mountMasterCount).to.equal(mountMasterCountBeforeRelease);
    }
  });

  it('subtracts gems from balance', () => {
    releaseMounts(user);

    expect(user.balance).to.equal(0);
  });
});
