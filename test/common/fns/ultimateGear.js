import ultimateGear from '../../../website/common/script/fns/ultimateGear';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.fns.ultimateGear', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.achievements.ultimateGearSets.toObject = function () {
      return this;
    };
    user.addNotification = sinon.spy();
  });

  it('sets armoirEnabled when partial achievement already achieved', () => {
    let items = {
      gear: {
        owned: {
          toObject: () => {
            return {
              armor_warrior_5: true, // eslint-disable-line camelcase
              shield_warrior_5: true, // eslint-disable-line camelcase
              head_warrior_5: true, // eslint-disable-line camelcase
              weapon_warrior_6: true, // eslint-disable-line camelcase
            };
          },
        },
      },
    };

    user.items = items;
    ultimateGear(user);

    expect(user.flags.armoireEnabled).to.equal(true);
    expect(user.addNotification).to.be.calledOnce;
    expect(user.addNotification).to.be.calledWith('ULTIMATE_GEAR_ACHIEVEMENT');
  });

  it('does not set armoirEnabled when gear is not owned', () => {
    let items = {
      gear: {
        owned: {
          toObject: () => {
            return {
              armor_warrior_5: true, // eslint-disable-line camelcase
              shield_warrior_5: true, // eslint-disable-line camelcase
              head_warrior_5: true, // eslint-disable-line camelcase
              weapon_warrior_6: false, // eslint-disable-line camelcase
            };
          },
        },
      },
    };

    user.items = items;
    ultimateGear(user);
    expect(user.flags.armoireEnabled).to.equal(false);
  });
});
