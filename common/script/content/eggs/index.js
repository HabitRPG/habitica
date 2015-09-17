// value & other defaults set below
let each = require('lodash').each;
let defaults = require('lodash').defaults;
let t = require('../helpers/translator');

let dropEggs = {
  Wolf: {
    text: t('dropEggWolfText'),
    adjective: t('dropEggWolfAdjective')
  },
  TigerCub: {
    text: t('dropEggTigerCubText'),
    mountText: t('dropEggTigerCubMountText'),
    adjective: t('dropEggTigerCubAdjective')
  },
  PandaCub: {
    text: t('dropEggPandaCubText'),
    mountText: t('dropEggPandaCubMountText'),
    adjective: t('dropEggPandaCubAdjective')
  },
  LionCub: {
    text: t('dropEggLionCubText'),
    mountText: t('dropEggLionCubMountText'),
    adjective: t('dropEggLionCubAdjective')
  },
  Fox: {
    text: t('dropEggFoxText'),
    adjective: t('dropEggFoxAdjective')
  },
  FlyingPig: {
    text: t('dropEggFlyingPigText'),
    adjective: t('dropEggFlyingPigAdjective')
  },
  Dragon: {
    text: t('dropEggDragonText'),
    adjective: t('dropEggDragonAdjective')
  },
  Cactus: {
    text: t('dropEggCactusText'),
    adjective: t('dropEggCactusAdjective')
  },
  BearCub: {
    text: t('dropEggBearCubText'),
    mountText: t('dropEggBearCubMountText'),
    adjective: t('dropEggBearCubAdjective')
  }
};

each(dropEggs, (egg, key) => {
  return defaults(egg, {
    canBuy: true,
    value: 3,
    key: key,
    notes: t('eggNotes', {
      eggText: egg.text,
      eggAdjective: egg.adjective
    }),
    mountText: egg.text
  });
});

module.exports = {
  dropEggs: dropEggs
}
