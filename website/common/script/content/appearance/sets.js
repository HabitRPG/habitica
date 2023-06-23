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
    setPrice: 5, availableFrom: '2023-04-11T08:00-05:00', availableUntil: EVENTS.spring2023.end, text: t('shimmerColors'),
  },
  hauntedHairColors: {
    setPrice: 5, availableFrom: '2022-10-04T08:00-04:00', availableUntil: EVENTS.fall2022.end, text: t('hauntedColors'),
  },
  winteryHairColors: {
    setPrice: 5, availableFrom: '2023-01-17T08:00-05:00', availableUntil: EVENTS.winter2023.end, text: t('winteryColors'),
  },
  rainbowSkins: { setPrice: 5, text: t('rainbowSkins') },
  animalSkins: { setPrice: 5, text: t('animalSkins') },
  pastelSkins: {
    setPrice: 5, availableFrom: '2022-04-11T08:00-05:00', availableUntil: EVENTS.spring2023.end, text: t('pastelSkins'),
  },
  spookySkins: { setPrice: 5, availableUntil: '2016-01-01', text: t('spookySkins') },
  supernaturalSkins: {
    setPrice: 5, availableFrom: '2022-10-04T08:00-04:00', availableUntil: EVENTS.fall2022.end, text: t('supernaturalSkins'),
  },
  splashySkins: {
    setPrice: 5, availableFrom: '2023-07-11T08:00-05:00', availableUntil: EVENTS.summer2023.end, text: t('splashySkins'),
  },
  winterySkins: {
    setPrice: 5, availableFrom: '2023-01-17T08:00-05:00', availableUntil: EVENTS.winter2023.end, text: t('winterySkins'),
  },
});
