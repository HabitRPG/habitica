import {setGearSetDefaults} from '../../helpers';

let armor = {
  0: { value: 0 },
};

let head = {
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
  head: head,
  shield: shield,
  weapon: weapon,
};

setGearSetDefaults(baseSet, {setName: 'base'});

export default baseSet;
