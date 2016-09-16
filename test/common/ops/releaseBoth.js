import releaseBoth from '../../../website/common/script/ops/releaseBoth';
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
    user.items.currentMount = animal;
    user.items.currentPet = animal;
    user.items.pets[animal] = 5;
    user.items.mounts[animal] = true;
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
    let [, message] = releaseBoth(user);

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.achievements.triadBingoCount).to.equal(1);
  });

  it('grants triad bingo without gems', () => {
    user.balance = 0;
    user.achievements.triadBingo = 1;
    user.achievements.triadBingoCount = 1;

    let [, message] = releaseBoth(user);

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.achievements.triadBingoCount).to.equal(2);
  });

  it('releases pets', () => {
    let [, message] = releaseBoth(user);

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.items.pets[animal]).to.be.empty;
    expect(user.items.mounts[animal]).to.equal(null);
  });

  it('releases mounts', () => {
    let [, message] = releaseBoth(user);

    expect(message).to.equal(i18n.t('mountsAndPetsReleased'));
    expect(user.items.mounts[animal]).to.equal(null);
  });

  it('removes currentPet', () => {
    releaseBoth(user);

    expect(user.items.currentMount).to.be.empty;
    expect(user.items.currentPet).to.be.empty;
  });

  it('removes currentMount', () => {
    releaseBoth(user);

    expect(user.items.currentMount).to.be.empty;
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
