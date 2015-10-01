import {setGearSetDefaults} from '../../helpers';

let armor = {
  201402: { mystery: '201402', value: 0 },
  201403: { mystery: '201403', value: 0 },
  201405: { mystery: '201405', value: 0 },
  201406: { mystery: '201406', value: 0 },
  201407: { mystery: '201407', value: 0 },
  201408: { mystery: '201408', value: 0 },
  201409: { mystery: '201409', value: 0 },
  201410: { mystery: '201410', value: 0 },
  201412: { mystery: '201412', value: 0 },
  201501: { mystery: '201501', value: 0 },
  201503: { mystery: '201503', value: 0 },
  201504: { mystery: '201504', value: 0 },
  201506: { mystery: '201506', value: 0 },
  201508: { mystery: '201508', value: 0 },
  201509: { mystery: '201509', value: 0 },
  301404: { mystery: '301404', value: 0 },
};

let back = {
  201402: { mystery: '201402', value: 0 },
  201404: { mystery: '201404', value: 0 },
  201410: { mystery: '201410', value: 0 },
  201504: { mystery: '201504', value: 0 },
  201507: { mystery: '201507', value: 0 },
};

let eyewear = {
  201503: { mystery: '201503', value: 0 },
  201506: { mystery: '201506', value: 0 },
  201507: { mystery: '201507', value: 0 },
  301404: { mystery: '301404', value: 0 },
  301405: { mystery: '301405', value: 0 },
};

let head = {
  201402: { mystery: '201402', value: 0 },
  201405: { mystery: '201405', value: 0 },
  201406: { mystery: '201406', value: 0 },
  201407: { mystery: '201407', value: 0 },
  201408: { mystery: '201408', value: 0 },
  201411: { mystery: '201411', value: 0 },
  201412: { mystery: '201412', value: 0 },
  201501: { mystery: '201501', value: 0 },
  201505: { mystery: '201505', value: 0 },
  201508: { mystery: '201508', value: 0 },
  201509: { mystery:'201509', value: 0 },
  301404: { mystery: '301404', value: 0 },
  301405: { mystery: '301405', value: 0 },
};

let headAccessory = {
  201403: { mystery: '201403', value: 0 },
  201404: { mystery: '201404', value: 0 },
  201409: { mystery: '201409', value: 0 },
  201502: { mystery: '201502', value: 0 },
  301405: { mystery: '301405', value: 0 },
};

let shield = {
  301405: { mystery: '301405', value: 0 },
};

let weapon = {
  201411: { mystery: '201411', value: 0 },
  201502: { mystery: '201502', value: 0 },
  201505: { mystery: '201505', value: 0 },
  301404: { mystery: '301404', value: 0 },
};

let mysterySet = {
  armor: armor,
  back: back,
  eyewear: eyewear,
  head: head,
  headAccessory: headAccessory,
  shield: shield,
  weapon: weapon,
};

setGearSetDefaults(mysterySet, {setName: 'mystery'});

export default mysterySet;
