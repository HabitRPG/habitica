import unlock from '../../../website/common/script/ops/unlock';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
  BadRequest,
} from '../../../website/common/script/libs/errors';

describe('shared.ops.unlock', () => {
  let user;
  const unlockPath = 'shirt.convict,shirt.cross,shirt.fire,shirt.horizon,shirt.ocean,shirt.purple,shirt.rainbow,shirt.redblue,shirt.thunder,shirt.tropical,shirt.zombie';
  const unlockGearSetPath = 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars';
  const backgroundUnlockPath = 'background.giant_florals';
  const unlockCost = 1.25;
  const usersStartingGems = 5;

  beforeEach(() => {
    user = generateUser();
    user.balance = usersStartingGems;
  });

  it('returns an error when path is not provided', done => {
    try {
      unlock(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('pathRequired'));
      done();
    }
  });

  it('returns an error when user balance is too low', done => {
    user.balance = 0;

    try {
      unlock(user, { query: { path: unlockPath } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughGems'));
      done();
    }
  });

  it('returns an error when user already owns a full set', done => {
    try {
      unlock(user, { query: { path: unlockPath } });
      unlock(user, { query: { path: unlockPath } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('alreadyUnlocked'));
      done();
    }
  });

  // disabled until fully implemente
  xit('returns an error when user already owns items in a full set', done => {
    try {
      unlock(user, { query: { path: unlockPath } });
      unlock(user, { query: { path: unlockPath } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('alreadyUnlocked'));
      done();
    }
  });

  it('equips an item already owned', () => {
    expect(user.purchased.background.giant_florals).to.not.exist;

    unlock(user, { query: { path: backgroundUnlockPath } });
    const afterBalance = user.balance;
    const response = unlock(user, { query: { path: backgroundUnlockPath } });
    expect(user.balance).to.equal(afterBalance); // do not bill twice

    expect(response.message).to.not.exist;
    expect(user.preferences.background).to.equal('giant_florals');
  });

  it('un-equips an item already equipped', () => {
    expect(user.purchased.background.giant_florals).to.not.exist;

    unlock(user, { query: { path: backgroundUnlockPath } }); // unlock
    const afterBalance = user.balance;
    unlock(user, { query: { path: backgroundUnlockPath } }); // equip
    const response = unlock(user, { query: { path: backgroundUnlockPath } });
    expect(user.balance).to.equal(afterBalance); // do not bill twice

    expect(response.message).to.not.exist;
    expect(user.preferences.background).to.equal('');
  });

  it('unlocks a full set', () => {
    const [, message] = unlock(user, { query: { path: unlockPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    expect(user.purchased.shirt.convict).to.be.true;
  });

  it('unlocks a full set of gear', () => {
    const [, message] = unlock(user, { query: { path: unlockGearSetPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    expect(user.items.gear.owned.headAccessory_special_wolfEars).to.be.true;
  });

  it('unlocks a an item', () => {
    const [, message] = unlock(user, { query: { path: backgroundUnlockPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    expect(user.purchased.background.giant_florals).to.be.true;
  });

  it('reduces a user\'s balance', () => {
    const [, message] = unlock(user, { query: { path: unlockPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    expect(user.balance).to.equal(usersStartingGems - unlockCost);
  });
});
