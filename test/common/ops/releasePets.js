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
    user.items.currentPet = animal;
    user.items.pets[animal] = 5;
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
    let [, message] = releasePets(user);

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
});
