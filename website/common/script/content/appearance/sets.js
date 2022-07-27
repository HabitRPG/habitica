import t from '../translation';
import prefill from './prefill';
import { EVENTS } from '../constants';

export default prefill({
  baseHair1: { setPrice: 5, text: t('hairSet1') },
  baseHair2: { setPrice: 5, text: t('hairSet2') },
  baseHair3: { setPrice: 5, text: t('hairSet3') },
  facialHair: { setPrice: 5, text: t('bodyFacialHair') },
  specialShirts: { setPrice: 5, text: t('specialShirts') },
  winterHairColors: { setPrice: 5, availableUntil: '2016-01-01' },
  pastelHairColors: { setPrice: 5, availableUntil: '2016-01-01' },
  rainbowHairColors: { setPrice: 5, text: t('rainbowColors') },
  shimmerHairColors: {
    setPrice: 5, availableFrom: '2022-04-14T08:00-05:00', availableUntil: '2022-04-30T20:00-05:00', text: t('shimmerColors'),
  },
  hauntedHairColors: {
    setPrice: 5, availableFrom: '2021-09-28T08:00-04:00', availableUntil: '2021-10-31T20:00-04:00', text: t('hauntedColors'),
  },
  winteryHairColors: {
    setPrice: 5, availableFrom: '2021-12-23T08:00-05:00', availableUntil: '2022-01-31T20:00-05:00', text: t('winteryColors'),
  },
  rainbowSkins: { setPrice: 5, text: t('rainbowSkins') },
  animalSkins: { setPrice: 5, text: t('animalSkins') },
  pastelSkins: {
    setPrice: 5, availableFrom: '2022-04-14T08:00-05:00', availableUntil: '2022-04-30T20:00-05:00', text: t('pastelSkins'),
  },
  spookySkins: { setPrice: 5, availableUntil: '2016-01-01', text: t('spookySkins') },
  supernaturalSkins: {
    setPrice: 5, availableFrom: '2021-09-28T08:00-04:00', availableUntil: '2021-10-31T20:00-04:00', text: t('supernaturalSkins'),
  },
  splashySkins: {
    setPrice: 5, availableFrom: '2022-07-05T08:00-05:00', availableUntil: EVENTS.summer2022.end, text: t('splashySkins'),
  },
  winterySkins: {
    setPrice: 5, availableFrom: '2021-12-23T08:00-05:00', availableUntil: '2022-01-31T20:00-05:00', text: t('winterySkins'),
  },
});
