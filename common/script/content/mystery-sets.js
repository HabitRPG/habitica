import { each } from 'lodash';
let t = require('./translation.js');

let mysterySets = {
  201402: {
    start: '2014-02-22',
    end: '2014-02-28',
    //text: window.env.t('wingedMessengerSet'),
    //text: 'wingedMessengerSet', 
 
  },
  201403: {
    start: '2014-03-24',
    end: '2014-04-02',
    //text: 'forestWalkerSet',
  },
  201404: {
    start: '2014-04-24',
    end: '2014-05-02',
    //text: 'twilightButterflySet',
  },
  201405: {
    start: '2014-05-21',
    end: '2014-06-02',
    //text: 'flameWielderSet',
  },
  201406: {
    start: '2014-06-23',
    end: '2014-07-02',
    //text: 'octomageSet',
  },
  201407: {
    start: '2014-07-23',
    end: '2014-08-02',
    //text: 'underseaExplorerSet',
  },
  201408: {
    start: '2014-08-23',
    end: '2014-09-02',
    //text: 'sunSorcererSet',
  },
  201409: {
    start: '2014-09-24',
    end: '2014-10-02',
    //text: 'autumnStriderSet',
  },
  201410: {
    start: '2014-10-24',
    end: '2014-11-02',
    //text: 'wingedGoblinSet',
  },
  201411: {
    start: '2014-11-24',
    end: '2014-12-02',
    //text: 'feastAndFunSet',
  },
  201412: {
    start: '2014-12-25',
    end: '2015-01-02',
    //text: 'penguinSet',
  },
  201501: {
    start: '2015-01-26',
    end: '2015-02-02',
    //text: 'starryKnightSet',
  },
  201502: {
    start: '2015-02-24',
    end: '2015-03-02',
    //text: 'wingedEnchanterSet',
  },
  201503: {
    start: '2015-03-25',
    end: '2015-04-02',
    //text: 'aquamarineSet',
  },
  201504: {
    start: '2015-04-24',
    end: '2015-05-02',
    //text: 'busyBeeSet',
  },
  201505: {
    start: '2015-05-25',
    end: '2015-06-02',
    //text: 'greenKnightSet',
  },
  201506: {
    start: '2015-06-25',
    end: '2015-07-02',
    //text: 'neonSnorkelerSet',
  },
  201507: {
    start: '2015-07-24',
    end: '2015-08-02',
    //text: 'radSurferSet',
  },
  201508: {
    start: '2015-08-23',
    end: '2015-09-02',
    //text: 'cheetahCostumeSet',
  },
  201509: {
    start: '2015-09-24',
    end: '2015-10-02',
    //text: 'werewolfSet',
  },
  201510: {
    start: '2015-10-26',
    end: '2015-11-02',
    //text: 'hornedGoblinSet',
  },
  201511: {
    start: '2015-11-25',
    end: '2015-12-02',
    //text: 'woodWarriorSet',
  },
  301404: {
    start: '3014-03-24',
    end: '3014-04-02',
    //text: 'steampunkStandardSet',
  },
  301405: {
    start: '3014-04-24',
    end: '3014-05-02',
    //text: 'steampunkAccessoriesSet',
  },
  wondercon: {
    start: '2014-03-24',
    end: '2014-04-01',
  },
};

each(mysterySets, (value, key) => {
  value.key = key;
  value.text = t('mysterySet${key}'');
});

export default mysterySets;
