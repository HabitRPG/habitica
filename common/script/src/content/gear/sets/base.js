import {setGearSetDefaults} from '../../helpers';

let armor = {
  0: { value: 0 },
};

let back = {
  0: { value: 0 }
};

let body = {
  0: { value: 0 }
};

let eyewear = {
  0: { value: 0 }
};

let head = {
  0: { value: 0 },
};

let headAccessory = {
  0: { value: 0 },
};

let shield = {
  0: { value: 0 },
};

let weapon = {
  0: { value: 0 },
};

let baseSet = {
  armor: armor,
  back: back,
  body: body,
  eyewear: eyewear,
  head: head,
  headAccessory: headAccessory,
  shield: shield,
  weapon: weapon,
};

setGearSetDefaults(baseSet, {setName: 'base'});

export default baseSet;
