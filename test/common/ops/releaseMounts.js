import releaseMounts from '../../../common/script/ops/releaseMounts';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
} from '../../../common/script/libs/errors';

describe('shared.ops.releaseMounts', () => {
  let user;
  let animal = 'Wolf-Base';

  beforeEach(() => {
    user = generateUser();
    user.items.currentMount = animal;
    user.items.mounts[animal] = true;
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
    let response = releaseMounts(user);

    expect(response.message).to.equal(i18n.t('mountsReleased'));
    expect(user.items.mounts[animal]).to.equal(null);
  });

  it('removes currentMount', () => {
    releaseMounts(user);

    expect(user.items.currentMount).to.be.empty;
  });

  it('increases mountMasterCount achievement', () => {
    releaseMounts(user);

    expect(user.achievements.mountMasterCount).to.equal(1);
  });

  it('subtracts gems from balance', () => {
    releaseMounts(user);

    expect(user.balance).to.equal(0);
  });
});
