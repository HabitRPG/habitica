import releasePets from '../../../common/script/ops/releasePets';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../common/script/libs/errors';

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

  it('removes currentPet', () => {
    releasePets(user);

    expect(user.items.currentPet).to.be.empty;
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
