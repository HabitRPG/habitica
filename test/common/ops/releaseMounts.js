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
  let animal = 'Wolf-Base';

  beforeEach(() => {
    user = generateUser();
    for (let k in content.pets) {
      user.items.mounts[k] = content.pets[k];
      user.items.mounts[k] = true;
    }

    user.items.currentMount = animal;
    user.balance = 1;
  });

  it('returns an error when user balance is too low', (done) => {
    user.balance = 0;

    try {
      releaseMounts(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('releases mounts', () => {
    let message = releaseMounts(user)[1];

    expect(message).to.equal(i18n.t('mountsReleased'));
    expect(user.items.mounts[animal]).to.equal(null);
  });

  it('removes drop currentMount', () => {
    let mountInfo = content.mountInfo[user.items.currentMount];
    expect(mountInfo.type).to.equal('drop');
    releaseMounts(user);

    expect(user.items.currentMount).to.be.empty;
  });

  it('leaves non-drop mount equipped', () => {
    let questAnimal = 'Gryphon-Base';
    user.items.currentMount = questAnimal;
    user.items.mounts[questAnimal] = true;

    let mountInfo = content.mountInfo[user.items.currentMount];
    expect(mountInfo.type).to.not.equal('drop');
    releaseMounts(user);

    expect(user.items.currentMount).to.equal(questAnimal);
  });

  it('increases mountMasterCount achievement', () => {
    releaseMounts(user);
    expect(user.achievements.mountMasterCount).to.equal(1);
  });

  it('does not increase mountMasterCount achievement if mount is missing (null)', () => {
    let mountMasterCountBeforeRelease = user.achievements.mountMasterCount;
    user.items.mounts[animal] = null;

    releaseMounts(user);

    expect(user.achievements.mountMasterCount).to.equal(mountMasterCountBeforeRelease);
  });

  it('does not increase mountMasterCount achievement if mount is missing (undefined)', () => {
    let mountMasterCountBeforeRelease = user.achievements.mountMasterCount;
    delete user.items.mounts[animal];

    releaseMounts(user);

    expect(user.achievements.mountMasterCount).to.equal(mountMasterCountBeforeRelease);
  });

  it('subtracts gems from balance', () => {
    releaseMounts(user);

    expect(user.balance).to.equal(0);
  });
});
