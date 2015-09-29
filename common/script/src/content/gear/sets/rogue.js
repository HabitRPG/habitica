import {setGearSetDefaults} from '../../helpers';

let armor = {
  1: { per: 6, value: 30 },
  2: { per: 9, value: 45 },
  3: { per: 12, value: 65 },
  4: { per: 15, value: 90 },
  5: { per: 18, value: 120, last: true },
};

let head = {
  1: { per: 2, value: 15 },
  2: { per: 4, value: 25 },
  3: { per: 6, value: 40 },
  4: { per: 9, value: 60 },
  5: { per: 12, value: 80, last: true },
};

let weapon = {
  0: { str: 0, value: 0 },
  1: { str: 2, value: 20 },
  2: { str: 3, value: 35 },
  3: { str: 4, value: 50 },
  4: { str: 6, value: 70 },
  5: { str: 8, value: 90 },
  6: { str: 10, value: 120, last: true },
};

let rogueSet = {
  armor: armor,
  head: head,
  weapon: weapon,
};

setGearSetDefaults(rogueSet, {setName: 'rogue'});

export default rogueSet;
