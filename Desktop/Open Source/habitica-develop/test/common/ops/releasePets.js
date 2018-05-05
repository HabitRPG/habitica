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
  let animal = 'Wolf-Base';

  beforeEach(() => {
    user = generateUser();
    for (let k in content.pets) {
      user.items.pets[k] = content.pets[k];
      user.items.pets[k] = 5;
    }

    user.items.currentPet = animal;
    user.balance = 1;
  });

  it('returns an error when user balance is too low', (done) => {
    user.balance = 0;

    try {
      releasePets(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('releases pets', () => {
    let message = releasePets(user)[1];

    expect(message).to.equal(i18n.t('petsReleased'));
    expect(user.items.pets[animal]).to.equal(0);
  });

  it('removes drop currentPet', () => {
    let petInfo = content.petInfo[user.items.currentPet];
    expect(petInfo.type).to.equal('drop');
    releasePets(user);

    expect(user.items.currentPet).to.be.empty;
  });

  it('leaves non-drop pets equipped', () => {
    let questAnimal = 'Gryphon-Base';
    user.items.currentPet = questAnimal;
    user.items.pets[questAnimal] = 5;

    let petInfo = content.petInfo[user.items.currentPet];
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
    let beastMasterCountBeforeRelease = user.achievements.beastMasterCount;

    user.items.pets[animal] = 0;
    releasePets(user);

    expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
  });

  it('does not increment beastMasterCount if any pet is missing (null)', () => {
    let beastMasterCountBeforeRelease = user.achievements.beastMasterCount;
    user.items.pets[animal] = null;
    releasePets(user);

    expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
  });

  it('does not increment beastMasterCount if any pet is missing (undefined)', () => {
    let beastMasterCountBeforeRelease = user.achievements.beastMasterCount;
    delete user.items.pets[animal];
    releasePets(user);

    expect(user.achievements.beastMasterCount).to.equal(beastMasterCountBeforeRelease);
  });
});
