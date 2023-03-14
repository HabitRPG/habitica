import t from '../translation';

const QUEST_POTIONS = {
  amber: {
    text: t('questAmberText'),
    notes: t('questAmberNotes'),
    completion: t('questAmberCompletion'),
    value: 4,
    category: 'hatchingPotion',
    boss: {
      name: t('questAmberBoss'),
      hp: 300,
      str: 1.25,
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Amber',
          text: t('questAmberDropAmberPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Amber',
          text: t('questAmberDropAmberPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Amber',
          text: t('questAmberDropAmberPotion'),
        },
      ],
      gp: 50,
      exp: 100,
      unlock: t('questAmberUnlockText'),
    },
  },
  blackPearl: {
    text: t('questBlackPearlText'),
    notes: t('questBlackPearlNotes'),
    completion: t('questBlackPearlCompletion'),
    value: 4,
    category: 'hatchingPotion',
    boss: {
      name: t('questBlackPearlBoss'),
      hp: 725,
      str: 1.75,
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'BlackPearl',
          text: t('questBlackPearlDropBlackPearlPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'BlackPearl',
          text: t('questBlackPearlDropBlackPearlPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'BlackPearl',
          text: t('questBlackPearlDropBlackPearlPotion'),
        },
      ],
      gp: 50,
      exp: 450,
      unlock: t('questBlackPearlUnlockText'),
    },
  },
  bronze: {
    text: t('questBronzeText'),
    notes: t('questBronzeNotes'),
    completion: t('questBronzeCompletion'),
    value: 4,
    category: 'hatchingPotion',
    boss: {
      name: t('questBronzeBoss'),
      hp: 800,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Bronze',
          text: t('questBronzeDropBronzePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Bronze',
          text: t('questBronzeDropBronzePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Bronze',
          text: t('questBronzeDropBronzePotion'),
        },
      ],
      gp: 63,
      exp: 575,
      unlock: t('questBronzeUnlockText'),
    },
  },
  fluorite: {
    text: t('questFluoriteText'),
    notes: t('questFluoriteNotes'),
    completion: t('questFluoriteCompletion'),
    value: 4,
    category: 'hatchingPotion',
    boss: {
      name: t('questFluoriteBoss'),
      hp: 1200,
      str: 2,
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Fluorite',
          text: t('questFluoriteDropFluoritePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Fluorite',
          text: t('questFluoriteDropFluoritePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Fluorite',
          text: t('questFluoriteDropFluoritePotion'),
        },
      ],
      gp: 70,
      exp: 750,
      unlock: t('questFluoriteUnlockText'),
    },
  },
  onyx: {
    text: t('questOnyxText'),
    notes: t('questOnyxNotes'),
    completion: t('questOnyxCompletion'),
    value: 4,
    category: 'hatchingPotion',
    collect: {
      onyxStone: {
        text: t('questOnyxCollectOnyxStones'),
        count: 25,
      },
      plutoRune: {
        text: t('questOnyxCollectPlutoRunes'),
        count: 10,
      },
      leoRune: {
        text: t('questOnyxCollectLeoRunes'),
        count: 10,
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Onyx',
          text: t('questOnyxDropOnyxPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Onyx',
          text: t('questOnyxDropOnyxPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Onyx',
          text: t('questOnyxDropOnyxPotion'),
        },
      ],
      gp: 50,
      exp: 100,
      unlock: t('questOnyxUnlockText'),
    },
  },
  pinkMarble: {
    text: t('questPinkMarbleText'),
    notes: t('questPinkMarbleNotes'),
    completion: t('questPinkMarbleCompletion'),
    value: 4,
    category: 'hatchingPotion',
    boss: {
      name: t('questPinkMarbleBoss'),
      hp: 1200,
      str: 2,
      rage: {
        title: t('questPinkMarbleRageTitle'),
        description: t('questPinkMarbleRageDescription'),
        value: 50,
        progressDrain: 0.5,
        effect: t('questPinkMarbleRageEffect'),
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'PinkMarble',
          text: t('questPinkMarbleDropPinkMarblePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'PinkMarble',
          text: t('questPinkMarbleDropPinkMarblePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'PinkMarble',
          text: t('questPinkMarbleDropPinkMarblePotion'),
        },
      ],
      gp: 75,
      exp: 800,
      unlock: t('questPinkMarbleUnlockText'),
    },
  },
  ruby: {
    text: t('questRubyText'),
    notes: t('questRubyNotes'),
    completion: t('questRubyCompletion'),
    value: 4,
    category: 'hatchingPotion',
    collect: {
      rubyGem: {
        text: t('questRubyCollectRubyGems'),
        count: 25,
      },
      venusRune: {
        text: t('questRubyCollectVenusRunes'),
        count: 10,
      },
      aquariusRune: {
        text: t('questRubyCollectAquariusRunes'),
        count: 10,
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Ruby',
          text: t('questRubyDropRubyPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Ruby',
          text: t('questRubyDropRubyPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Ruby',
          text: t('questRubyDropRubyPotion'),
        },
      ],
      gp: 50,
      exp: 100,
      unlock: t('questRubyUnlockText'),
    },
  },
  silver: {
    text: t('questSilverText'),
    notes: t('questSilverNotes'),
    completion: t('questSilverCompletion'),
    value: 4,
    category: 'hatchingPotion',
    collect: {
      silverIngot: {
        text: t('questSilverCollectSilverIngots'),
        count: 20,
      },
      moonRune: {
        text: t('questSilverCollectMoonRunes'),
        count: 15,
      },
      cancerRune: {
        text: t('questSilverCollectCancerRunes'),
        count: 15,
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Silver',
          text: t('questSilverDropSilverPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Silver',
          text: t('questSilverDropSilverPotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Silver',
          text: t('questSilverDropSilverPotion'),
        },
      ],
      gp: 50,
      exp: 100,
      unlock: t('questSilverUnlockText'),
    },
  },
  stone: {
    text: t('questStoneText'),
    notes: t('questStoneNotes'),
    completion: t('questStoneCompletion'),
    value: 4,
    category: 'hatchingPotion',
    collect: {
      mossyStone: {
        text: t('questStoneCollectMossyStones'),
        count: 25,
      },
      marsRune: {
        text: t('questStoneCollectMarsRunes'),
        count: 10,
      },
      capricornRune: {
        text: t('questStoneCollectCapricornRunes'),
        count: 10,
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'MossyStone',
          text: t('questStoneDropMossyStonePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'MossyStone',
          text: t('questStoneDropMossyStonePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'MossyStone',
          text: t('questStoneDropMossyStonePotion'),
        },
      ],
      gp: 50,
      exp: 100,
      unlock: t('questStoneUnlockText'),
    },
  },
  turquoise: {
    text: t('questTurquoiseText'),
    notes: t('questTurquoiseNotes'),
    completion: t('questTurquoiseCompletion'),
    value: 4,
    category: 'hatchingPotion',
    collect: {
      turquoiseGem: {
        text: t('questTurquoiseCollectTurquoiseGems'),
        count: 25,
      },
      sagittariusRune: {
        text: t('questTurquoiseCollectSagittariusRunes'),
        count: 10,
      },
      neptuneRune: {
        text: t('questTurquoiseCollectNeptuneRunes'),
        count: 10,
      },
    },
    drop: {
      items: [
        {
          type: 'hatchingPotions',
          key: 'Turquoise',
          text: t('questTurquoiseDropTurquoisePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Turquoise',
          text: t('questTurquoiseDropTurquoisePotion'),
        }, {
          type: 'hatchingPotions',
          key: 'Turquoise',
          text: t('questTurquoiseDropTurquoisePotion'),
        },
      ],
      gp: 50,
      exp: 100,
      unlock: t('questTurquoiseUnlockText'),
    },
  },
};
export default QUEST_POTIONS;
