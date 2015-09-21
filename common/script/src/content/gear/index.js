import t from '../helpers/translator';
import events from '../events';

import weapon from './weapon';
import armor from './armor';
import head from './head';
import shield from './shield';
import back from './back';
import body from './body';
import headAccessory from './head-accessory';
import eyewear from './eyewear';

let gear = {
  weapon: weapon,
  armor: armor,
  head: head,
  shield: shield,
  back: back,
  body: body,
  headAccessory: headAccessory,
  eyewear: eyewear,
};

export default gear;
