import t from '../translation';
import prefill from './prefill.js';

module.exports = prefill({
  baseHair1: {setPrice: 5, text: t('hairSet1')},
  baseHair2: {setPrice: 5, text: t('hairSet2')},
  baseHair3: {setPrice: 5, text: t('hairSet3')},
  facialHair: {setPrice: 5, text: t('bodyFacialHair')},
  specialShirts: {setPrice: 5, text: t('specialShirts')},
  winterHairColors: {setPrice: 5, availableUntil: '2016-01-01'},
  pastelHairColors: {setPrice: 5, availableUntil: '2016-01-01'},
  rainbowHairColors: {setPrice: 5, text: t('rainbowColors')},
  shimmerHairColors: {setPrice: 5, availableFrom: '2019-04-09', availableUntil: '2019-05-02', text: t('shimmerColors')},
  hauntedHairColors: {setPrice: 5, availableFrom: '2018-10-11', availableUntil: '2018-11-02', text: t('hauntedColors')},
  winteryHairColors: {setPrice: 5, availableFrom: '2019-01-08', availableUntil: '2019-02-02', text: t('winteryColors')},
  rainbowSkins: {setPrice: 5, text: t('rainbowSkins')},
  animalSkins: {setPrice: 5, text: t('animalSkins')},
  pastelSkins: {setPrice: 5, availableFrom: '2019-04-09', availableUntil: '2019-05-02', text: t('pastelSkins')},
  spookySkins: {setPrice: 5, availableUntil: '2016-01-01', text: t('spookySkins')},
  supernaturalSkins: {setPrice: 5, availableFrom: '2018-10-11', availableUntil: '2018-11-02', text: t('supernaturalSkins')},
  splashySkins: {setPrice: 5, availableFrom: '2019-07-02', availableUntil: '2019-08-02', text: t('splashySkins')},
  winterySkins: {setPrice: 5, availableFrom: '2019-01-08', availableUntil: '2019-02-02', text: t('winterySkins')},
});
