import cloneDeep from 'lodash/cloneDeep';

import { shield as baseShield } from './sets/base';

import { shield as healerShield } from './sets/healer';
import { weapon as rogueWeapon } from './sets/rogue';
import { shield as warriorShield } from './sets/warrior';
import { shield as wizardShield } from './sets/wizard';

import armoire from './sets/armoire';
import { shield as mysteryShield } from './sets/mystery';
import { shield as specialShield } from './sets/special';

const rogueShield = cloneDeep(rogueWeapon);

const shield = {
  base: baseShield,

  warrior: warriorShield,
  rogue: rogueShield,
  wizard: wizardShield,
  healer: healerShield,

  special: specialShield,
  mystery: mysteryShield,
  get armoire () {
    return armoire.shield;
  },
};

export default shield;
