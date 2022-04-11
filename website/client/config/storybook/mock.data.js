import { v4 as generateUUID } from 'uuid';
import getters from '@/store/getters';

export const userStyles = {
  contributor: {
    admin: true,
    level: 9,
    text: '',
  },
  items: {
    gear: {
      equipped: {
        armor: 'armor_special_2',
        head: 'head_special_2',
        shield: 'shield_special_goldenknight',
        headAccessory: 'headAccessory_base_0',
        eyewear: 'eyewear_base_0',
        weapon: 'weapon_special_1',
        back: 'back_base_0',
      },
      costume: {
        armor: 'armor_special_fallRogue',
        head: 'head_special_fallRogue',
        shield: 'shield_armoire_shieldOfDiamonds',
        body: 'body_mystery_201706',
        eyewear: 'eyewear_special_blackHalfMoon',
        back: 'back_base_0',
        headAccessory: 'headAccessory_special_wolfEars',
        weapon: 'weapon_armoire_lamplighter',
      },
    },
  },
  preferences: {
    hair: {
      color: 'black', base: 0, bangs: 3, beard: 0, mustache: 0, flower: 0,
    },
    tasks: { groupByChallenge: false, confirmScoreNotes: false },
    size: 'broad',
    skin: 'wolf',
    shirt: 'zombie',
    chair: 'none',
    sleep: true,
    disableClasses: false,
    background: 'midnight_castle',
    costume: true,
  },
  stats: {
    buffs: {
      str: 0,
      int: 0,
      per: 0,
      con: 0,
      stealth: 0,
      streaks: false,
      snowball: false,
      spookySparkles: false,
      shinySeed: false,
      seafoam: false,
    },
    training: {
      int: 0, per: 0, str: 0, con: 0,
    },
    hp: 50,
    mp: 158,
    exp: 227,
    gp: 464.31937261345155,
    lvl: 17,
    class: 'rogue',
    points: 17,
    str: 0,
    con: 0,
    int: 0,
    per: 0,
    toNextLevel: 380,
    maxHealth: 50,
    maxMP: 158,
  },
  profile: {
    name: 'user',
  },
  _id: generateUUID(),
  flags: {
    classSelected: true,
  },
};


export function mockStore ({
  userData,
  ...state
}) {
  return {
    getters,
    dispatch: () => {
    },
    watch: () => {
    },
    state: {
      user: {
        data: {
          ...userData,
        },
      },
      ...state,
    },
  };
}
