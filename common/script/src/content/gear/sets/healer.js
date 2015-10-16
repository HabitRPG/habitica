import {setGearSetDefaults} from '../../helpers';

let armor = {
  1: { con: 6, value: 30 },
  2: { con: 9, value: 45 },
  3: { con: 12, value: 65 },
  4: { con: 15, value: 90 },
  5: { con: 18, value: 120, last: true },
};

let head = {
  1: { int: 2, value: 15 },
  2: { int: 3, value: 25 },
  3: { int: 5, value: 40 },
  4: { int: 7, value: 60 },
  5: { int: 9, value: 80, last: true },
};

let shield = {
  1: { con: 2, value: 20 },
  2: { con: 4, value: 35 },
  3: { con: 6, value: 50 },
  4: { con: 9, value: 70 },
  5: { con: 12, value: 90, last: true },
};

let weapon = {
  0: { value: 0 },
  1: { int: 2, value: 20 },
  2: { int: 3, value: 30 },
  3: { int: 5, value: 45 },
  4: { int: 7, value: 65 },
  5: { int: 9, value: 90 },
  6: { int: 11, value: 120, last: true },
};

let healerSet = {
  armor: armor,
  head: head,
  shield: shield,
  weapon: weapon,
};

setGearSetDefaults(healerSet, {setName: 'healer'});

export default healerSet;
