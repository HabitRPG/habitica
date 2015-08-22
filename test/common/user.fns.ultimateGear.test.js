'use strict';

var shared = require('../../common/script/index.coffee');
shared.i18n.translations = require('../../website/src/i18n.js').translations

require('./test_helper');

describe('User.fns.ultimateGear', function() {

  it('sets armoirEnabled when partial achievement already achieved', function() {
    var user = shared.wrap({
      items: { gear: { owned: {
        toObject: function() { return {
          armor_warrior_5:  true,
          shield_warrior_5: true,
          head_warrior_5:   true,
          weapon_warrior_6: true
        }}
      }}},
      achievements: {
        ultimateGearSets: {}
      },
      flags: {}
    });
    user.fns.ultimateGear();
    expect(user.flags.armoireEnabled).to.equal(true);
  });
});
