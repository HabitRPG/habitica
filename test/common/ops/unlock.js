import get from 'lodash/get';
import unlock from '../../../website/common/script/ops/unlock';
import i18n from '../../../website/common/script/i18n';
import { generateUser } from '../../helpers/common.helper';
import { NotAuthorized, BadRequest } from '../../../website/common/script/libs/errors';

describe('shared.ops.unlock', () => {
  let user;
  const unlockPath = 'shirt.convict,shirt.cross,shirt.fire,shirt.horizon,shirt.ocean,shirt.purple,shirt.rainbow,shirt.redblue,shirt.thunder,shirt.tropical,shirt.zombie';
  const unlockGearSetPath = 'items.gear.owned.headAccessory_special_bearEars,items.gear.owned.headAccessory_special_cactusEars,items.gear.owned.headAccessory_special_foxEars,items.gear.owned.headAccessory_special_lionEars,items.gear.owned.headAccessory_special_pandaEars,items.gear.owned.headAccessory_special_pigEars,items.gear.owned.headAccessory_special_tigerEars,items.gear.owned.headAccessory_special_wolfEars';
  const backgroundUnlockPath = 'background.giant_florals';
  const backgroundSetUnlockPath = 'background.archery_range,background.giant_florals,background.rainbows_end';
  const hairUnlockPath = 'hair.color.rainbow,hair.color.yellow,hair.color.green,hair.color.purple,hair.color.blue,hair.color.TRUred';
  const facialHairUnlockPath = 'hair.mustache.1,hair.mustache.2,hair.beard.1,hair.beard.2,hair.beard.3';
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

  it('returns an error if an item does not exists', done => {
    try {
      unlock(user, { query: { path: 'background.invalid_background' } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidUnlockSet'));
      done();
    }
  });

  it('returns an error if there are items from multiple sets', done => {
    try {
      unlock(user, { query: { path: 'shirt.convict,skin.0ff591' } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidUnlockSet'));
      done();
    }
  });

  it('returns an error if gear is not from the animal set', done => {
    try {
      unlock(user, { query: { path: 'items.gear.owned.back_mystery_202004' } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidUnlockSet'));
      done();
    }
  });

  it('returns an error if the item is free', done => {
    try {
      unlock(user, { query: { path: 'shirt.black' } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidUnlockSet'));
      done();
    }
  });

  it('returns an error if an item does not belong to a set (appearances)', done => {
    try {
      unlock(user, { query: { path: 'shirt.pink' } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidUnlockSet'));
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

  it('unlocks a full set of appearance items', () => {
    const initialShirts = Object.keys(user.purchased.shirt).length;
    const [, message] = unlock(user, { query: { path: unlockPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    const individualPaths = unlockPath.split(',');
    individualPaths.forEach(path => {
      expect(get(user.purchased, path)).to.be.true;
    });
    expect(Object.keys(user.purchased.shirt).length)
      .to.equal(initialShirts + individualPaths.length);
    expect(user.balance).to.equal(usersStartingGems - 1.25);
  });

  it('unlocks a full set of hair items', () => {
    user.purchased.hair.color = {};

    const initialHairColors = Object.keys(user.purchased.hair.color).length;
    const [, message] = unlock(user, { query: { path: hairUnlockPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    const individualPaths = hairUnlockPath.split(',');
    individualPaths.forEach(path => {
      expect(get(user.purchased, path)).to.be.true;
    });
    expect(Object.keys(user.purchased.hair.color).length)
      .to.equal(initialHairColors + individualPaths.length);
    expect(user.balance).to.equal(usersStartingGems - 1.25);
  });

  it('unlocks the facial hair set', () => {
    user.purchased.hair.mustache = {};
    user.purchased.hair.beard = {};

    const initialMustache = Object.keys(user.purchased.hair.mustache).length;
    const initialBeard = Object.keys(user.purchased.hair.mustache).length;
    const [, message] = unlock(user, { query: { path: facialHairUnlockPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    const individualPaths = facialHairUnlockPath.split(',');
    individualPaths.forEach(path => {
      expect(get(user.purchased, path)).to.be.true;
    });
    expect(Object.keys(user.purchased.hair.mustache).length + Object.keys(user.purchased.hair.beard).length) // eslint-disable-line max-len
      .to.equal(initialMustache + initialBeard + individualPaths.length);
    expect(user.balance).to.equal(usersStartingGems - 1.25);
  });

  it('unlocks a full set of gear', () => {
    const initialGear = Object.keys(user.items.gear.owned).length;
    const [, message] = unlock(user, { query: { path: unlockGearSetPath } });

    expect(message).to.equal(i18n.t('unlocked'));

    const individualPaths = unlockGearSetPath.split(',');
    individualPaths.forEach(path => {
      expect(get(user, path)).to.be.true;
    });
    expect(Object.keys(user.items.gear.owned).length)
      .to.equal(initialGear + individualPaths.length);
    expect(user.balance).to.equal(usersStartingGems - 1.25);
  });

  it('unlocks a full set of backgrounds', () => {
    const initialBackgrounds = Object.keys(user.purchased.background).length;
    const [, message] = unlock(user, { query: { path: backgroundSetUnlockPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    const individualPaths = backgroundSetUnlockPath.split(',');
    individualPaths.forEach(path => {
      expect(get(user.purchased, path)).to.be.true;
    });
    expect(Object.keys(user.purchased.background).length)
      .to.equal(initialBackgrounds + individualPaths.length);
    expect(user.balance).to.equal(usersStartingGems - 3.75);
  });

  it('unlocks an item (appearance)', () => {
    const path = unlockPath.split(',')[0];
    const initialShirts = Object.keys(user.purchased.shirt).length;
    const [, message] = unlock(user, { query: { path } });

    expect(message).to.equal(i18n.t('unlocked'));
    expect(Object.keys(user.purchased.shirt).length).to.equal(initialShirts + 1);
    expect(get(user.purchased, path)).to.be.true;
    expect(user.balance).to.equal(usersStartingGems - 0.5);
  });

  it('unlocks an item (hair color)', () => {
    user.purchased.hair.color = {};

    const path = hairUnlockPath.split(',')[0];
    const initialColorHair = Object.keys(user.purchased.hair.color).length;
    const [, message] = unlock(user, { query: { path } });

    expect(message).to.equal(i18n.t('unlocked'));
    expect(Object.keys(user.purchased.hair.color).length).to.equal(initialColorHair + 1);
    expect(get(user.purchased, path)).to.be.true;
    expect(user.balance).to.equal(usersStartingGems - 0.5);
  });

  it('unlocks an item (facial hair)', () => {
    user.purchased.hair.mustache = {};
    user.purchased.hair.beard = {};

    const path = facialHairUnlockPath.split(',')[0];
    const initialMustache = Object.keys(user.purchased.hair.mustache).length;
    const initialBeard = Object.keys(user.purchased.hair.beard).length;
    const [, message] = unlock(user, { query: { path } });

    expect(message).to.equal(i18n.t('unlocked'));

    expect(Object.keys(user.purchased.hair.mustache).length).to.equal(initialMustache + 1);
    expect(Object.keys(user.purchased.hair.beard).length).to.equal(initialBeard);

    expect(get(user.purchased, path)).to.be.true;
    expect(user.balance).to.equal(usersStartingGems - 0.5);
  });

  it('unlocks an item (gear)', () => {
    const path = unlockGearSetPath.split(',')[0];
    const initialGear = Object.keys(user.items.gear.owned).length;
    const [, message] = unlock(user, { query: { path } });

    expect(message).to.equal(i18n.t('unlocked'));
    expect(Object.keys(user.items.gear.owned).length).to.equal(initialGear + 1);
    expect(get(user, path)).to.be.true;
    expect(user.balance).to.equal(usersStartingGems - 0.5);
  });

  it('unlocks an item (background)', () => {
    const initialBackgrounds = Object.keys(user.purchased.background).length;
    const [, message] = unlock(user, { query: { path: backgroundUnlockPath } });

    expect(message).to.equal(i18n.t('unlocked'));
    expect(Object.keys(user.purchased.background).length).to.equal(initialBackgrounds + 1);
    expect(get(user.purchased, backgroundUnlockPath)).to.be.true;
    expect(user.balance).to.equal(usersStartingGems - 1.75);
  });
});
