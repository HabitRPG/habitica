/* eslint-disable key-spacing */
import moment from 'moment';

// gem block: number of gems
const gemsPromo = {
  '4gems': 5,
  '21gems': 30,
  '42gems': 60,
  '84gems': 125,
};

export const REPEATING_EVENTS = {
  nye: {
    start: new Date('1970-12-28T04:00-05:00'),
    end: new Date('1970-01-04T03:59-05:00'),
    season: 'nye',
    npcImageSuffix: '_nye',
    content: [
      {
        type: 'cards',
        items: [
          'nye',
        ],
      },
    ],
  },
  birthday: {
    start: new Date('1970-01-30T04:00-05:00'),
    end: new Date('1970-02-01T03:59-05:00'),
    season: 'birthday',
    npcImageSuffix: '_birthday',
    foodSeason: 'Cake',
  },
  valentines: {
    start: new Date('1970-02-10T04:00-05:00'),
    end: new Date('1970-02-17T03:59-05:00'),
    season: 'valentines',
    npcImageSuffix: '_valentines',
    content: [
      {
        type: 'cards',
        items: [
          'valentine',
        ],
      },
    ],
  },
  piDay: {
    start: new Date('1970-03-14T04:00-04:00'),
    end: new Date('1970-03-16T03:59-04:00'),
    foodSeason: 'Pie',
  },
  aprilFoolsResale: {
    start: new Date('1970-04-07T04:00-04:00'),
    end: new Date('1970-05-01T03:59-04:00'),
    content: [
      {
        type: 'hatchingPotionQuests',
        items: [
          'virtualpet',
          'waffle',
          'fungi',
        ],
      },
      {
        type: 'premiumHatchingPotions',
        items: [
          'Veggie',
          'TeaShop',
        ],
      },
    ],
  },
  namingDay: {
    start: new Date('1970-07-31T04:00-04:00'),
    end: new Date('1970-08-02T03:59-04:00'),
    foodSeason: 'Cake',
  },
  fallGemSale: {
    start: new Date('1970-09-23T04:00-04:00'),
    end: new Date('1970-09-27T23:59-04:00'),
    event: 'fall_extra_gems',
    gemsPromo,
  },
  spookyGemSale: {
    start: new Date('1970-10-28T04:00-04:00'),
    end: new Date('1970-11-01T23:59-04:00'),
    event: 'spooky_extra_gems',
    gemsPromo,
  },
  habitoween: {
    start: new Date('1970-10-30T04:00-04:00'),
    end: new Date('1970-11-01T23:59-04:00'),
    foodSeason: 'Candy',
    season: 'habitoween',
    npcImageSuffix: '_halloween',
  },
  harvestFeast: {
    start: new Date('1970-11-20T04:00-05:00'),
    end: new Date('1970-12-01T03:59-05:00'),
    season: 'thanksgiving',
    npcImageSuffix: '_thanksgiving',
    foodSeason: 'Pie',
  },
  giftOneGetOne: {
    start: new Date('1970-12-19T04:00-05:00'),
    end: new Date('1970-01-06T23:59-05:00'),
    promo: 'g1g1',
  },
};

export function getRepeatingEvents (date) {
  const momentDate = date instanceof moment ? date : moment(date);
  return Object.keys(REPEATING_EVENTS).map(eventKey => {
    const event = REPEATING_EVENTS[eventKey];
    if (!event.key) {
      event.key = eventKey;
    }
    event.start.setYear(momentDate.year());
    event.end.setYear(momentDate.year());
    if (event.end < event.start && momentDate < event.start) {
      event.start.setYear(momentDate.year() - 1);
    } else if (event.end < event.start && momentDate > event.end) {
      event.end.setYear(momentDate.year() + 1);
    }
    return event;
  }).filter(event => momentDate.isBetween(event.start, event.end));
}

export const EVENTS = {
  noEvent: {
    start: '2024-05-01T00:00-04:00',
    end: '2024-05-13T23:59-04:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  bundle202405: {
    start: '2024-05-21T08:00-04:00',
    end: '2024-05-31T23:59-04:00',
  },
  potions202405: {
    start: '2024-05-14T08:00-04:00',
    end: '2024-05-31T23:59-04:00',
  },
  aprilFoolsQuest2024: {
    start: '2024-04-09T08:00-04:00',
    end: '2024-04-30T23:59-04:00',
  },

  aprilFools2024: {
    start: '2024-04-01T00:00-04:00',
    end: '2024-04-02T08:00-04:00',
    aprilFools: 'Fungi',
  },
  spring2024: {
    start: '2024-03-21T00:00-04:00',
    end: '2024-04-30T23:59-04:00',
    npcImageSuffix: '_spring',
    season: 'spring',
    gear: true,
  },
  bundle202403: {
    start: '2024-03-19T00:00-05:00',
    end: '2024-03-31T08:00-05:00',
  },
  bundle202402: {
    start: '2024-02-20T00:00-05:00',
    end: '2024-02-29T08:00-05:00',
  },
  potions202402: {
    start: '2024-02-12T00:00-05:00',
    end: '2024-02-29T08:00-05:00',
  },
  valentine2024: {
    start: '2024-02-12T00:00-05:00',
    end: '2024-02-16T08:00-05:00',
    season: 'valentines',
    npcImageSuffix: '_valentines',
  },
  nye2023: {
    start: '2023-12-28T08:00-05:00',
    end: '2024-01-04T23:59-05:00',
    season: 'nye',
    npcImageSuffix: '_nye',
  },
  winter2024: {
    start: '2023-12-19T08:00-05:00',
    end: '2024-01-31T23:59-05:00',
    npcImageSuffix: '_winter',
    season: 'winter',
    gear: true,
  },
  g1g12023: {
    start: '2023-12-18T08:00-05:00',
    end: '2024-01-09T23:59-05:00',
    promo: 'g1g1',
  },
  potions202311: {
    start: '2023-11-14T08:00-04:00',
    end: '2023-11-30T23:59-04:00',
  },
  bundle202311: {
    start: '2023-11-09T08:00-04:00',
    end: '2023-11-30T23:59-04:00',
  },
  bundle202310: {
    start: '2023-10-17T08:00-04:00',
    end: '2023-10-31T23:59-04:00',
  },
  potions202310: {
    start: '2023-09-21T08:00-04:00',
    end: '2023-10-31T23:59-04:00',
  },
  fall2023: {
    start: '2023-09-21T08:00-04:00',
    end: '2023-10-31T23:59-04:00',
    npcImageSuffix: '_fall',
    season: 'fall',
    gear: true,
  },
  bundle202309: {
    start: '2023-09-12T08:00-04:00',
    end: '2023-09-30T23:59-04:00',
  },
  bundle202308: {
    start: '2023-08-15T08:00-04:00',
    end: '2023-08-31T23:59-04:00',
  },
  potions202308: {
    start: '2023-08-15T08:00-04:00',
    end: '2023-08-31T23:59-04:00',
  },
  summer2023: {
    start: '2023-06-20T08:00-04:00',
    end: '2023-07-31T23:59-04:00',
    npcImageSuffix: '_summer',
    season: 'summer',
    gear: true,
  },
  bundle202306: {
    start: '2023-06-13T08:00-04:00',
    end: '2023-06-30T23:59-04:00',
  },
  bundle202305: {
    start: '2023-05-23T08:00-04:00',
    end: '2023-05-31T23:59-04:00',
  },
  potions202305: {
    start: '2023-05-16T08:00-04:00',
    end: '2023-05-31T23:59-04:00',
  },
  aprilFools2023: {
    start: '2023-04-01T08:00-04:00',
    end: '2023-04-02T08:00-04:00',
    aprilFools: 'teaShop',
  },
  spring2023: {
    start: '2023-03-21T08:00-04:00',
    end: '2023-04-30T23:59-04:00',
    npcImageSuffix: '_spring',
    season: 'spring',
    gear: true,
  },
  bundle202303: {
    start: '2023-03-16T08:00-04:00',
    end: '2023-03-31T23:59-04:00',
  },
  bundle202302: {
    start: '2023-02-21T08:00-05:00',
    end: '2023-02-28T23:59-05:00',
  },
  potions202302: {
    start: '2023-02-13T08:00-05:00',
    end: '2023-02-28T23:59-05:00',
  },
  valentines2023: {
    start: '2023-02-13T08:00-05:00',
    end: '2023-02-17T23:59-05:00',
    season: 'valentines',
    npcImageSuffix: '_valentines',
  },
  birthday10: {
    start: '2023-01-30T08:00-05:00',
    end: '2023-02-08T23:59-05:00',
    season: 'birthday',
    npcImageSuffix: '_birthday',
  },
  winter2023: {
    start: '2022-12-20T08:00-05:00',
    end: '2023-01-31T23:59-05:00',
    npcImageSuffix: '_winter',
    season: 'winter',
    gear: true,
  },
  g1g12022: {
    start: '2022-12-15T08:00-05:00',
    end: '2023-01-08T23:59-05:00',
    promo: 'g1g1',
  },
  harvestFeast2022: {
    start: '2022-11-22T08:00-05:00',
    end: '2022-11-27T20:00-05:00',
    season: 'thanksgiving',
    npcImageSuffix: '_thanksgiving',
  },
  afterGala: {
    start: '2022-10-31T20:00-04:00',
    end: '2022-11-22T08:00-05:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  bundle202211: {
    start: '2022-11-15T08:00-05:00',
    end: '2022-11-30T20:00-05:00',
  },
  fall2022: {
    start: '2022-09-20T08:00-04:00',
    end: '2022-10-31T20:00-04:00',
    npcImageSuffix: '_fall',
    season: 'fall',
    gear: true,
  },
  bundle202210: {
    start: '2022-10-13T08:00-04:00',
    end: '2022-10-31T20:00-04:00',
  },
  beforeGala: {
    start: '2022-07-31T20:00-04:00',
    end: '2022-09-20T08:00-04:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  bundle202209: {
    start: '2022-09-13T08:00-04:00',
    end: '2022-09-30T20:00-04:00',
  },
  potions202208: {
    start: '2022-08-16T08:00-04:00',
    end: '2022-08-31T20:00-04:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  bundle202208: {
    start: '2022-08-09T08:00-04:00',
    end: '2022-09-30T20:00-04:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  summer2022: {
    start: '2022-06-21T08:00-04:00',
    end: '2022-07-31T20:00-04:00',
    season: 'summer',
    npcImageSuffix: '_summer',
    gear: true,
  },
  bundle202206: {
    start: '2022-06-14T08:00-04:00',
    end: '2022-06-30T20:00-04:00',
  },
  potions202205: {
    start: '2022-05-17T08:00-04:00',
    end: '2022-05-31T20:00-04:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  spring2022: {
    start: '2022-03-22T08:00-05:00',
    end: '2022-04-30T20:00-05:00',
    npcImageSuffix: '_spring',
    season: 'spring',
    gear: true,
  },
  aprilFools2022: {
    start: '2022-04-01T08:00-05:00',
    end: '2022-04-02T08:00-05:00',
    aprilFools: 'virtual',
  },
  valentines2022: {
    start: '2022-02-14T08:00-05:00',
    end: '2022-02-18T20:00-05:00',
    season: 'valentines',
    npcImageSuffix: 'valentines',
  },
  winter2022: {
    start: '2021-12-21T08:00-05:00',
    end: '2022-01-31T20:00-05:00',
    season: 'winter',
    npcImageSuffix: '_winter',
    gear: true,
  },
  winter2022Promo: {
    start: '2021-12-16T08:00-05:00',
    end: '2022-01-06T20:00-05:00',
    promo: 'g1g1',
  },
  prePromoNoEvent: {
    start: '2021-11-28T20:00-05:00',
    end: '2021-12-16T08:00-05:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  thanksgiving2021: {
    start: '2021-11-24T08:00-05:00',
    end: '2021-11-28T20:00-05:00',
    season: 'thanksgiving',
    npcImageSuffix: '_thanksgiving',
  },
  potions202111: {
    start: '2021-11-09T08:00-05:00',
    end: '2021-11-30T20:00-05:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  fall2021: {
    start: '2021-09-21T08:00-04:00',
    end: '2021-10-31T20:00-04:00',
    npcImageSuffix: '_fall',
    season: 'fall',
    gear: true,
  },
  bundle202109: {
    start: '2021-09-13T08:00-04:00',
    end: '2021-09-30T20:00-04:00',
  },
  potions202108: {
    start: '2021-08-17T08:00-04:00',
    end: '2021-08-31T20:00-04:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  summer2021: {
    start: '2021-06-23T08:00-04:00',
    end: '2021-07-31T20:00-04:00',
    season: 'summer',
    npcImageSuffix: 'summer',
    gear: true,
  },
  bundle202106: {
    start: '2021-06-08T08:00-04:00',
    end: '2021-07-31T20:00-04:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  potions202105: {
    start: '2021-05-11T08:00-05:00',
    end: '2021-05-31T20:00-05:00',
    season: 'normal',
    npcImageSuffix: '',
  },
  spring2021: {
    start: '2021-03-23T08:00-05:00',
    end: '2021-04-30T20:00-05:00',
    npcImageSuffix: 'spring',
    season: 'spring',
    gear: true,
  },
  aprilFools2021: {
    start: '2021-04-01T08:00-05:00',
    end: '2021-04-02T08:00-05:00',
    aprilFools: 'invert',
  },
  winter2021: {
    start: '2020-12-17T08:00-05:00',
    end: '2021-01-31T20:00-05:00',
    season: 'winter',
    npcImageSuffix: 'winter',
    gear: true,
  },
  winter2021Promo: {
    // used in tests, not an actual past event
    start: '2020-12-01T08:00-05:00',
    end: '2020-12-17T20:00-05:00',
    season: 'winter',
    promo: 'g1g1',
  },
  fall2020: {
    start: '2020-09-22T08:00-04:00',
    end: '2020-10-31T20:00-04:00',
    gear: true,
    gemsPromo,
  },
  // Dates from this point on (^) are in the RFC 2822 format, see https://momentjs.com/docs/#/parsing/string/

  summer2020: { start: '2020-06-18', end: '2020-08-02', gear: true },
  spring2020: { start: '2020-03-17', end: '2020-05-02', gear: true },
  winter2020: { start: '2019-12-19', end: '2020-02-02', gear: true },
  fall2019: { start: '2019-09-24', end: '2019-11-02', gear: true },
  summer2019: { start: '2019-06-18', end: '2019-08-02', gear: true },
  spring2019: { start: '2019-03-19', end: '2019-05-02', gear: true },
  winter2019: { start: '2018-12-19', end: '2019-02-02', gear: true },
  fall2018: { start: '2018-09-20', end: '2018-11-02', gear: true },
  summer2018: { start: '2018-06-19', end: '2018-08-02', gear: true },
  spring2018: { start: '2018-03-20', end: '2018-05-02', gear: true },
  winter2018: { start: '2017-12-19', end: '2018-02-02', gear: true },
  fall2017: { start: '2017-09-21', end: '2017-11-02', gear: true },
  summer2017: { start: '2017-06-20', end: '2017-08-02', gear: true },
  spring2017: { start: '2017-03-21', end: '2017-05-02', gear: true },
  winter2017: { start: '2016-12-16', end: '2017-02-02', gear: true },
  fall2016: { start: '2016-09-20', end: '2016-11-02', gear: true },
  summer2016: { start: '2016-06-21', end: '2016-08-02', gear: true },
  spring2016: { start: '2016-03-18', end: '2016-05-02', gear: true },
  winter2016: { start: '2015-12-18', end: '2016-02-02', gear: true },
  gaymerx: { start: '2016-09-29', end: '2016-10-03' },
  fall2015: { start: '2015-09-21', end: '2015-11-01', gear: true },
  summer2015: { start: '2015-06-20', end: '2015-08-02', gear: true },
  spring2015: { start: '2015-03-20', end: '2015-05-02', gear: true },
  winter2015: { start: '2014-12-21', end: '2015-02-02', gear: true },
  fall: { start: '2014-09-21', end: '2014-11-01', gear: true },
  summer: { start: '2014-06-20', end: '2014-08-01', gear: true },
  spring: { start: '2014-03-21', end: '2014-05-01', gear: true },
  birthday: { start: '2017-01-31', end: '2017-02-02' },
  winter: { start: '2013-12-31', end: '2014-02-01' },
};
