import {setGearSetDefaults} from '../../helpers';

let armor = {
  1: { con: 3, value: 30 },
  2: { con: 5, value: 45 },
  3: { con: 7, value: 65 },
  4: { con: 9, value: 90 },
  5: { con: 11, value: 120, last: true },
};

let head = {
  1: { str: 2, value: 15 },
  2: { str: 4, value: 25 },
  3: { str: 6, value: 40 },
  4: { str: 9, value: 60 },
  5: { str: 12, value: 80, last: true },
};

let shield = {
  1: { con: 2, value: 20 },
  2: { con: 3, value: 35 },
  3: { con: 5, value: 50 },
  4: { con: 7, value: 70 },
  5: { con: 9, value: 90, last: true },
};

let weapon = {
  0: { value: 1 },
  1: { str: 3, value: 20 },
  2: { str: 6, value: 30 },
  3: { str: 9, value: 45 },
  4: { str: 12, value: 65 },
  5: { str: 15, value: 90 },
  6: { str: 18, value: 120, last: true },
};

let warriorSet = {
  armor: armor,
  head: head,
  shield: shield,
  weapon: weapon,
};

setGearSetDefaults(warriorSet, {setName: 'warrior'});

export default warriorSet;
