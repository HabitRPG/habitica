import releasePets from '../../../website/common/script/ops/releasePets';
import content from '../../../website/common/script/content/index';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../website/common/script/libs/errors';

describe('shared.ops.releasePets', () => {
  let user;
  const animal = 'Wolf-Base';

  beforeEach(() => {
    user = generateUser();
    Object.keys(content.pets).forEach(k => {
      user.items.pets[k] = content.pets[k];
      user.items.pets[k] = 5;
    });

    user.items.currentPet = animal;
    user.balance = 1;
  });

  it('returns an error when user balance is too low', done => {
    user.balance = 0;

    try {
      releasePets(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('returns an error when user does not have all pets', done => {
    const petKeys = Object.keys(user.items.pets);
    delete user.items.pets[petKeys[0]];

    try {
      releasePets(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughPets'));
      done();
    }
  });

  it('releases pets', () => {
    const message = releasePets(user)[1];

    expect(message).to.equal(i18n.t('petsReleased'));
    expect(user.items.pets[animal]).to.equal(0);
  });

  it('removes drop currentPet', () => {
    const petInfo = content.petInfo[user.items.currentPet];
    expect(petInfo.type).to.equal('drop');
    releasePets(user);

    expect(user.items.currentPet).to.be.empty;
  });

  it('leaves non-drop pets equipped', () => {
    const questAnimal = 'Gryphon-Base';
    user.items.currentPet = questAnimal;
    user.items.pets[questAnimal] = 5;

    const petInfo = content.petInfo[user.items.currentPet];
    expect(petInfo.type).to.not.equal('drop');
    releasePets(user);

    expect(user.items.currentPet).to.equal(questAnimal);
  });

  it('decreases user\'s balance', () => {
    releasePets(user);

    expect(user.balance).to.equal(0);
  });

  it('incremenets beastMasterCount', () => {
    releasePets(user);

    expect(user.achievements.beastMasterCount).to.equal(1);
  });

  it('does not increment beastMasterCount if any pet is level 0 (released)', () => {
    const beastMasterCountBeforeRelease = user.achievements.beastMasterCount;
    user.items.pets[animal] = 0;

    try {
      releasePets(user);
    } catch (e) {
      expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
    }
  });

  it('does not increment beastMasterCount if any pet is missing (null)', () => {
    const beastMasterCountBeforeRelease = user.achievements.beastMasterCount;
    user.items.pets[animal] = null;

    try {
      releasePets(user);
    } catch (e) {
      expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
    }
  });

  it('does not increment beastMasterCount if any pet is missing (undefined)', () => {
    const beastMasterCountBeforeRelease = user.achievements.beastMasterCount;
    delete user.items.pets[animal];

    try {
      releasePets(user);
    } catch (e) {
      expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
    }
  });
});
