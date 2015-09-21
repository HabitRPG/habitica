import {each, defaults, assign} from 'lodash';
import capitalize from 'lodash.capitalize';
import camelCase from 'lodash.camelCase';
import t from '../helpers/translator';

let dilatoryDistressSeries = {
  dilatoryDistress1: {
    goldValue: 200,
    collect: {
      fireCoral: {
        text: t('questDilatoryDistress1CollectFireCoral'),
        count: 25
      },
      blueFins: {
        text: t('questDilatoryDistress1CollectBlueFins'),
        count: 25
      }
    },
    drop: {
      items: [
        {
          type: 'gear',
          key: 'armor_special_finnedOceanicArmor',
          text: t('questDilatoryDistress1DropArmor')
        }
      ],
      exp: 75
    }
  },
  dilatoryDistress2: {
    previous: 'dilatoryDistress1',
    goldValue: 300,
    boss: {
      hp: 500,
      rage: {
        title: t('questDilatoryDistress2RageTitle'),
        description: t('questDilatoryDistress2RageDescription'),
        value: 50,
        healing: .3,
        effect: t('questDilatoryDistress2RageEffect')
      }
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Skeleton',
          text: t('questDilatoryDistress2DropSkeletonPotion')
        }, {
          type: 'hatchingPotions',
          key: 'CottonCandyBlue',
          text: t('questDilatoryDistress2DropCottonCandyBluePotion')
        }, {
          type: 'gear',
          key: 'head_special_fireCoralCirclet',
          text: t('questDilatoryDistress2DropHeadgear')
        }
      ],
      exp: 500
    }
  },
  dilatoryDistress3: {
    previous: 'dilatoryDistress2',
    goldValue: 400,
    boss: {
      hp: 1000,
      str: 2
    },
    drop: {
      items: [
        {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'food',
          key: 'Fish',
          text: t('questDilatoryDistress3DropFish')
        }, {
          type: 'gear',
          key: 'weapon_special_tridentOfCrashingTides',
          text: t('questDilatoryDistress3DropWeapon')
        }, {
          type: 'gear',
          key: 'shield_special_moonpearlShield',
          text: t('questDilatoryDistress3DropShield')
        }
      ],
      exp: 650
    },
  },
};

let goldPurchasableQuests = { };

assign(goldPurchasableQuests, dilatoryDistressSeries);

each(goldPurchasableQuests, (quest, name) => {
  let camelName = camelCase(name);
  let capitalizedName = capitalize(camelName);

  let questDefaults = {
    text: t(`quest${capitalizedName}Text`),
    notes: t(`quest${capitalizedName}Notes`),
    completion: t(`quest${capitalizedName}Completion`),
    category: 'gold',
    value: 4,
  };

  let bossDefaults = {
    name: t(`quest${capitalizedName}Boss`),
  };

  let dropDefaults = {
    gold: 0
  };

  defaults(quest, questDefaults);

  if (quest.boss) defaults(quest.boss, bossDefaults);
  if (quest.drop) defaults(quest.drop, dropDefaults);
});

export default goldPurchasableQuests;
