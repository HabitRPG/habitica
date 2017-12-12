import releaseBoth from '../../../website/common/script/ops/releaseBoth';
import content from '../../../website/common/script/content/index';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';

describe('shared.ops.releaseBoth', () => {
  let user;
  let animal = 'Wolf-Base';

  beforeEach(() => {
    user = generateUser();
    for (let p in content.pets) {
      user.items.pets[p] = content.pets[p];
      user.items.pets[p] = 5;
    }

    for (let m in content.pets) {
      user.items.mounts[m] = content.pets[m];
      user.items.mounts[m] = true;
    }

    user.items.currentMount = animal;
    user.items.currentPet = animal;
    user.balance = 1.5;
  });

  it('returns an error when user balance is too low and user does not have triadBingo', (done) => {
    user.balance = 0;

    try {
      releaseBoth(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('grants triad bingo with gems', () => {
    let message = releaseBoth(user)[1];

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.achievements.triadBingoCount).to.equal(1);
  });

  it('grants triad bingo without gems', () => {
    user.balance = 0;
    user.achievements.triadBingo = 1;
    user.achievements.triadBingoCount = 1;

    let message = releaseBoth(user)[1];

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.achievements.triadBingoCount).to.equal(2);
  });

  it('does not grant triad bingo if any pet has not been previously found', () => {
    let triadBingoCountBeforeRelease = user.achievements.triadBingoCount;
    user.items.pets[animal] = -1;
    let message = releaseBoth(user)[1];

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.achievements.triadBingoCount).to.equal(triadBingoCountBeforeRelease);
  });

  it('releases pets', () => {
    let message = releaseBoth(user)[1];

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.items.pets[animal]).to.be.empty;
    expect(user.items.mounts[animal]).to.equal(null);
  });

  it('does not increment beastMasterCount if any pet is level 0 (released)', () => {
    let beastMasterCountBeforeRelease = user.achievements.beastMasterCount;
    user.items.pets[animal] = 0;

    releaseBoth(user);

    expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
  });

  it('does not increment beastMasterCount if any pet is missing (null)', () => {
    let beastMasterCountBeforeRelease = user.achievements.beastMasterCount;
    user.items.pets[animal] = null;
    releaseBoth(user);

    expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
  });

  it('does not increment beastMasterCount if any pet is missing (undefined)', () => {
    let beastMasterCountBeforeRelease = user.achievements.beastMasterCount;
    delete user.items.pets[animal];
    releaseBoth(user);

    expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
  });

  it('releases mounts', () => {
    let message = releaseBoth(user)[1];

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.items.mounts[animal]).to.equal(null);
  });

  it('does not increase mountMasterCount achievement if mount is missing (null)', () => {
    let mountMasterCountBeforeRelease = user.achievements.mountMasterCount;
    user.items.mounts[animal] = null;

    releaseBoth(user);

    expect(user.achievements.mountMasterCount).to.equal(mountMasterCountBeforeRelease);
  });

  it('does not increase mountMasterCount achievement if mount is missing (undefined)', () => {
    let mountMasterCountBeforeRelease = user.achievements.mountMasterCount;
    delete user.items.mounts[animal];

    releaseBoth(user);

    expect(user.achievements.mountMasterCount).to.equal(mountMasterCountBeforeRelease);
  });

  it('removes drop currentPet', () => {
    let petInfo = content.petInfo[user.items.currentPet];
    expect(petInfo.type).to.equal('drop');
    releaseBoth(user);

    expect(user.items.currentMount).to.be.empty;
    expect(user.items.currentPet).to.be.empty;
  });

  it('removes drop currentMount', () => {
    let mountInfo = content.mountInfo[user.items.currentMount];
    expect(mountInfo.type).to.equal('drop');
    releaseBoth(user);

    expect(user.items.currentMount).to.be.empty;
  });

  it('leaves non-drop pets and mounts equipped', () => {
    let questAnimal = 'Gryphon-Base';
    user.items.currentMount = questAnimal;
    user.items.currentPet = questAnimal;
    user.items.pets[questAnimal] = 5;
    user.items.mounts[questAnimal] = true;

    let petInfo = content.petInfo[user.items.currentPet];
    expect(petInfo.type).to.not.equal('drop');
    let mountInfo = content.mountInfo[user.items.currentMount];
    expect(mountInfo.type).to.not.equal('drop');

    releaseBoth(user);

    expect(user.items.currentMount).to.equal(questAnimal);
    expect(user.items.currentPet).to.equal(questAnimal);
  });

  it('decreases user\'s balance', () => {
    releaseBoth(user);

    expect(user.balance).to.equal(0);
  });

  it('incremenets beastMasterCount', () => {
    releaseBoth(user);

    expect(user.achievements.beastMasterCount).to.equal(1);
  });

  it('incremenets mountMasterCount', () => {
    releaseBoth(user);

    expect(user.achievements.mountMasterCount).to.equal(1);
  });
});
