/* eslint-disable camelcase */

let shared = require('../../common/script/index.js');

shared.i18n.translations = require('../../website/src/libs/i18n.js').translations;

require('./test_helper');

describe('User.fns.ultimateGear', () => {
  it('sets armoirEnabled when partial achievement already achieved', () => {
    let items = {
      gear: {
        owned: {
          toObject: () => {
            return {
              armor_warrior_5: true,
              shield_warrior_5: true,
              head_warrior_5: true,
              weapon_warrior_6: true,
            };
          },
        },
      },
    };

    let user = shared.wrap({
      items,
      achievements: {
        ultimateGearSets: {},
      },
      flags: {},
    });

    user.fns.ultimateGear();
    expect(user.flags.armoireEnabled).to.equal(true);
  });
});
