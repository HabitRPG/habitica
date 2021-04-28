/* eslint-disable key-spacing */

// gem block: number of gems
const gemsPromo = {
  '4gems': 5,
  '21gems': 30,
  '42gems': 60,
  '84gems': 125,
};

export const EVENTS = {
  noCurrentEvent2021: {
    start: '2021-04-30T08:00-05:00',
    end: '2021-08-23T08:00-05:00',
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
  valentines2021: {
    start: '2021-02-07T08:00-05:00',
    end: '2021-02-16T08:00-05:00',
    season: 'valentines',
    npcImageSuffix: 'valentines',
  },
  winter2021: {
    start: '2020-12-17T08:00-05:00',
    end: '2021-01-31T20:00-05:00',
    season: 'winter',
    npcImageSuffix: 'winter',
    gear: true,
  },
  winter2021Promo: { // used in tests, not an actual past event
    start: '2020-12-01T08:00-05:00',
    end: '2020-12-17T20:00-05:00',
    season: 'winter',
    promo: 'g1g1',
  },
  fall2020:   {
    start: '2020-09-22T08:00-04:00',
    end: '2020-10-31T20:00-04:00',
    gear: true,
    gemsPromo,
  },
  // Dates from this point on (^) are in the RFC 2822 format, see https://momentjs.com/docs/#/parsing/string/

  summer2020: { start: '2020-06-18', end: '2020-08-02', gear: true },
  spring2020: { start: '2020-03-17', end: '2020-05-02', gear: true },
  winter2020: { start: '2019-12-19', end: '2020-02-02', gear: true },
  fall2019:   { start: '2019-09-24', end: '2019-11-02', gear: true },
  summer2019: { start: '2019-06-18', end: '2019-08-02', gear: true },
  spring2019: { start: '2019-03-19', end: '2019-05-02', gear: true },
  winter2019: { start: '2018-12-19', end: '2019-02-02', gear: true },
  fall2018:   { start: '2018-09-20', end: '2018-11-02', gear: true },
  summer2018: { start: '2018-06-19', end: '2018-08-02', gear: true },
  spring2018: { start: '2018-03-20', end: '2018-05-02', gear: true },
  winter2018: { start: '2017-12-19', end: '2018-02-02', gear: true },
  fall2017:   { start: '2017-09-21', end: '2017-11-02', gear: true },
  summer2017: { start: '2017-06-20', end: '2017-08-02', gear: true },
  spring2017: { start: '2017-03-21', end: '2017-05-02', gear: true },
  winter2017: { start: '2016-12-16', end: '2017-02-02', gear: true },
  fall2016:   { start: '2016-09-20', end: '2016-11-02', gear: true },
  summer2016: { start: '2016-06-21', end: '2016-08-02', gear: true },
  spring2016: { start: '2016-03-18', end: '2016-05-02', gear: true },
  winter2016: { start: '2015-12-18', end: '2016-02-02', gear: true },
  gaymerx:    { start: '2016-09-29', end: '2016-10-03' },
  fall2015:   { start: '2015-09-21', end: '2015-11-01', gear: true },
  summer2015: { start: '2015-06-20', end: '2015-08-02', gear: true },
  spring2015: { start: '2015-03-20', end: '2015-05-02', gear: true },
  winter2015: { start: '2014-12-21', end: '2015-02-02', gear: true },
  fall:       { start: '2014-09-21', end: '2014-11-01', gear: true },
  summer:     { start: '2014-06-20', end: '2014-08-01', gear: true },
  spring:     { start: '2014-03-21', end: '2014-05-01', gear: true },
  birthday:   { start: '2017-01-31', end: '2017-02-02' },
  winter:     { start: '2013-12-31', end: '2014-02-01' },
};
