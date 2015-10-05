import {each, where} from 'lodash';
import {flat as flattenedGear} from './gear/index';

let mysterySets = {
  201402: {
    start: '2014-02-22',
    end: '2014-02-28',
    text: 'Winged Messenger Set'
  },
  201403: {
    start: '2014-03-24',
    end: '2014-04-02',
    text: 'Forest Walker Set'
  },
  201404: {
    start: '2014-04-24',
    end: '2014-05-02',
    text: 'Twilight Butterfly Set'
  },
  201405: {
    start: '2014-05-21',
    end: '2014-06-02',
    text: 'Flame Wielder Set'
  },
  201406: {
    start: '2014-06-23',
    end: '2014-07-02',
    text: 'Octomage Set'
  },
  201407: {
    start: '2014-07-23',
    end: '2014-08-02',
    text: 'Undersea Explorer Set'
  },
  201408: {
    start: '2014-08-23',
    end: '2014-09-02',
    text: 'Sun Sorcerer Set'
  },
  201409: {
    start: '2014-09-24',
    end: '2014-10-02',
    text: 'Autumn Strider Set'
  },
  201410: {
    start: '2014-10-24',
    end: '2014-11-02',
    text: 'Winged Goblin Set'
  },
  201411: {
    start: '2014-11-24',
    end: '2014-12-02',
    text: 'Feast and Fun Set'
  },
  201412: {
    start: '2014-12-25',
    end: '2015-01-02',
    text: 'Penguin Set'
  },
  201501: {
    start: '2015-01-26',
    end: '2015-02-02',
    text: 'Starry Knight Set'
  },
  201502: {
    start: '2015-02-24',
    end: '2015-03-02',
    text: 'Winged Enchanter Set'
  },
  201503: {
    start: '2015-03-25',
    end: '2015-04-02',
    text: 'Aquamarine Set'
  },
  201504: {
    start: '2015-04-24',
    end: '2015-05-02',
    text: 'Busy Bee Set'
  },
  201505: {
    start: '2015-05-25',
    end: '2015-06-02',
    text: 'Green Knight Set'
  },
  201506: {
    start: '2015-06-25',
    end: '2015-07-02',
    text: 'Neon Snorkeler Set'
  },
  201507: {
    start: '2015-07-24',
    end: '2015-08-02',
    text: 'Rad Surfer Set'
  },
  201508: {
    start: '2015-08-23',
    end: '2015-09-02',
    text: 'Cheetah Costume Set'
  },
  201509: {
    start:'2015-09-24',
    end:'2015-10-02',
    text:'Werewolf Set'
  },
  301404: {
    start: '3014-03-24',
    end: '3014-04-02',
    text: 'Steampunk Standard Set'
  },
  301405: {
    start: '3014-04-24',
    end: '3014-05-02',
    text: 'Steampunk Accessories Set'
  },
  wondercon: { // @TODO: extract this out of mystery items
    start: '2014-03-24',
    end: '2014-04-01'
  }
};

each(mysterySets, (objectSet, name) => {
  objectSet.key = name;
  objectSet.items = where(flattenedGear, {
    mystery: name
  });
});

export default mysterySets;
