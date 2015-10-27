import {setGearSetDefaults} from '../../helpers';

let armor = {
  1: { int: 2, value: 30 },
  2: { int: 4, value: 45 },
  3: { int: 6, value: 65 },
  4: { int: 9, value: 90 },
  5: { int: 12, value: 120, last: true },
};

let head = {
  1: { per: 2, value: 15 },
  2: { per: 3, value: 25 },
  3: { per: 5, value: 40 },
  4: { per: 7, value: 60 },
  5: { per: 10, value: 80, last: true },
};

let shield = {
  // Wizard's weapons are two handed
  // And thus do not have shields
  // But the content structure still expects an object
};

let weapon = {
  0: { twoHanded: true, value: 0 },
  1: { twoHanded: true, int: 3, per: 1, value: 30 },
  2: { twoHanded: true, int: 6, per: 2, value: 50 },
  3: { twoHanded: true, int: 9, per: 3, value: 80 },
  4: { twoHanded: true, int: 12, per: 5, value: 120 },
  5: { twoHanded: true, int: 15, per: 7, value: 160 },
  6: { twoHanded: true, int: 18, per: 10, value: 200, last: true },
};

let wizardSet = {
  armor: armor,
  head: head,
  shield: shield,
  weapon: weapon,
};

setGearSetDefaults(wizardSet, {setName: 'wizard'});

export default wizardSet;
