import unlock from '../../../website/common/script/ops/unlock';
import i18n from '../../../website/common/script/i18n';
import { generateUser } from '../../helpers/common.helper';
import { NotAuthorized, BadRequest } from '../../../website/common/script/libs/errors';

describe('shared.ops.unlock', () => {
  let user;
  const unlockPath = 'shirt.convict,shirt.cross,shirt.fire,shirt.horizon,shirt.ocean,shirt.purple,shirt.rainbow,shirt.redblue,shirt.thunder,shirt.tropical,shirt.zombie';
  const unlockGearSetPath = 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars';
  const backgroundUnlockPath = 'background.giant_florals';
  const unlockCost = 1.25;
  const usersStartingGems = 50 / 4;

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

  it('does not unlock lost gear', done => {
    user.items.gear.owned.headAccessory_special_bearEars = false;

    unlock(user, { query: { path: 'items.gear.owned.headAccessory_special_bearEars' } });

    expect(user.balance).to.equal(usersStartingGems);
    done();
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
    let expectedBalance;

    try {
      unlock(user, { query: { path: unlockPath } });
      expectedBalance = user.balance;
      unlock(user, { query: { path: unlockPath } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('alreadyUnlocked'));
      expect(user.balance).to.equal(expectedBalance);
      done();
    }
  });

  it('returns an error when user already owns a full set of gear', done => {
    let expectedBalance;

    try {
      unlock(user, { query: { path: unlockGearSetPath } });
      expectedBalance = user.balance;
      unlock(user, { query: { path: unlockGearSetPath } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('alreadyUnlocked'));
      expect(user.balance).to.equal(expectedBalance);
      done();
    }
  });

  it('returns an error when user already owns items in a full set and it would be more expensive to buy the entire set', done => {
    try {
      // There are 11 shirts in the set, each cost 2 gems, the full set 5 gems
      // In order for the full purchase not to be worth, we must own 9
      const partialUnlockPaths = unlockPath.split(',');
      unlock(user, { query: { path: partialUnlockPaths[0] } });
      unlock(user, { query: { path: partialUnlockPaths[1] } });
      unlock(user, { query: { path: partialUnlockPaths[2] } });
      unlock(user, { query: { path: partialUnlockPaths[3] } });
      unlock(user, { query: { path: partialUnlockPaths[4] } });
      unlock(user, { query: { path: partialUnlockPaths[5] } });
      unlock(user, { query: { path: partialUnlockPaths[6] } });
      unlock(user, { query: { path: partialUnlockPaths[7] } });
      unlock(user, { query: { path: partialUnlockPaths[8] } });

      unlock(user, { query: { path: unlockPath } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('alreadyUnlockedPart'));
      done();
    }
  });

  it('does not return an error when user already owns items in a full set and it would not be more expensive to buy the entire set', () => {
    // There are 11 shirts in the set, each cost 2 gems, the full set 5 gems
    // In order for the full purchase to be worth, we can own already 8
    const partialUnlockPaths = unlockPath.split(',');
    unlock(user, { query: { path: partialUnlockPaths[0] } });
    unlock(user, { query: { path: partialUnlockPaths[1] } });
    unlock(user, { query: { path: partialUnlockPaths[2] } });
    unlock(user, { query: { path: partialUnlockPaths[3] } });
    unlock(user, { query: { path: partialUnlockPaths[4] } });
    unlock(user, { query: { path: partialUnlockPaths[5] } });
    unlock(user, { query: { path: partialUnlockPaths[6] } });
    unlock(user, { query: { path: partialUnlockPaths[7] } });

    unlock(user, { query: { path: unlockPath } });
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

  it('un-equips a background already equipped', () => {
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

  it('unlocks an item', () => {
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
