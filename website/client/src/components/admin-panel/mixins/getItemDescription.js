import content from '@/../../common/script/content';

function _getGearSetName (key) {
  let set = 'NO SET [probably an omission in the API data]';
  if (content.gear.flat[key].set) {
    set = `${content.gear.flat[key].set}`;
  }
  return set;
}

function _getGearSetDescription (key) {
  let setName = _getGearSetName(key);
  if (setName === 'special-takeThis') {
    // no point displaying set details for gear where it's obvious
    return '';
  }
  const klassNames = {
    healer: 'Healer',
    rogue: 'Rogue',
    warrior: 'Warrior',
    wizard: 'Mage',
  };
  const lunarBattleQuestGear = ['armor_special_lunarWarriorArmor', 'head_special_lunarWarriorHelm', 'weapon_special_lunarScythe'];

  const loginIncentivesGear = ['armor_special_bardRobes', 'armor_special_dandySuit', 'armor_special_lunarWarriorArmor', 'armor_special_nomadsCuirass', 'armor_special_pageArmor', 'armor_special_samuraiArmor', 'armor_special_sneakthiefRobes', 'armor_special_snowSovereignRobes', 'back_special_snowdriftVeil', 'head_special_bardHat', 'head_special_clandestineCowl', 'head_special_dandyHat', 'head_special_kabuto', 'head_special_lunarWarriorHelm', 'head_special_pageHelm', 'head_special_snowSovereignCrown', 'head_special_spikedHelm', 'shield_special_diamondStave', 'shield_special_lootBag', 'shield_special_wakizashi', 'shield_special_wintryMirror', 'weapon_special_bardInstrument', 'weapon_special_fencingFoil', 'weapon_special_lunarScythe', 'weapon_special_nomadsScimitar', 'weapon_special_pageBanner', 'weapon_special_skeletonKey', 'weapon_special_tachi'];

  const goldQuestsGear = ['armor_special_finnedOceanicArmor', 'head_special_fireCoralCirclet', 'weapon_special_tridentOfCrashingTides', 'shield_special_moonpearlShield', 'head_special_pyromancersTurban', 'armor_special_pyromancersRobes', 'weapon_special_taskwoodsLantern', 'armor_special_mammothRiderArmor', 'head_special_mammothRiderHelm', 'weapon_special_mammothRiderSpear', 'shield_special_mammothRiderHorn', 'armor_special_roguishRainbowMessengerRobes', 'head_special_roguishRainbowMessengerHood', 'weapon_special_roguishRainbowMessage', 'shield_special_roguishRainbowMessage', 'eyewear_special_aetherMask', 'body_special_aetherAmulet', 'back_special_aetherCloak', 'weapon_special_aetherCrystals'];

  const animalGear = ['back_special_bearTail', 'back_special_cactusTail', 'back_special_foxTail', 'back_special_lionTail', 'back_special_pandaTail', 'back_special_pigTail', 'back_special_tigerTail', 'back_special_wolfTail', 'headAccessory_special_bearEars', 'headAccessory_special_cactusEars', 'headAccessory_special_foxEars', 'headAccessory_special_lionEars', 'headAccessory_special_pandaEars', 'headAccessory_special_pigEars', 'headAccessory_special_tigerEars', 'headAccessory_special_wolfEars'];

  let wantSetName = true; // some set names are useful, others aren't
  let setType = '[cannot determine set type]';
  if (setName === 'base-0') {
    setType = 'empty slot';
    wantSetName = false;
  } else if (setName.includes('special-turkey')) {
    setType = '<a href="https://habitica.fandom.com/wiki/Turkey_Day">Turkey Day</a>';
    wantSetName = false;
  } else if (setName.includes('special-nye')) {
    setType = '<a href="https://habitica.fandom.com/wiki/Event_Item_Sequences">New Year\'s Eve</a>';
    wantSetName = false;
  } else if (setName.includes('special-birthday')) {
    setType = '<a href="https://habitica.fandom.com/wiki/Habitica_Birthday_Bash">Habitica Birthday Bash</a>';
    wantSetName = false;
  } else if (setName.includes('special-0') || key === 'weapon_special_3') {
    setType = '<a href="https://habitica.fandom.com/wiki/Kickstarter">Kickstarter 2013</a>';
    wantSetName = false;
  } else if (setName.includes('special-1')) {
    setType = 'Contributor gear';
    wantSetName = false;
  } else if (setName.includes('special-2') || key === 'shield_special_goldenknight') {
    setType = '<a href="https://habitica.fandom.com/wiki/Legendary_Equipment">Legendary Equipment</a>';
    wantSetName = false;
  } else if (setName.includes('special-wondercon')) {
    setType = '<a href="https://habitica.fandom.com/wiki/Unconventional_Armor">Unconventional Armor</a>';
    wantSetName = false;
  } else if (lunarBattleQuestGear.includes(key)) {
    setType = '<a href="https://habitica.fandom.com/wiki/Quest_Lines#Lunar_Battle_Quest_Line">Lunar Battle Quest Line</a>';
    wantSetName = false;
  } else if (loginIncentivesGear.includes(key)) {
    setType = '<a href="https://habitica.fandom.com/wiki/Daily_Check-In_Incentives">Check-In Incentive</a>';
    wantSetName = false;
  } else if (goldQuestsGear.includes(key)) {
    setType = 'from <a href="https://habitica.fandom.com/wiki/Quest_Lines#Gold_Purchasable_Quest_Lines">Gold-Purchasable Quest Lines</a>';
    wantSetName = false;
  } else if (animalGear.includes(key)) {
    setType = '<a href="https://habitica.fandom.com/wiki/Avatar_Customizations">Animal Avatar Accessory Customisations</a>';
    wantSetName = false;
  } else if (!content.gear.flat[key].klass) {
    setType = 'NO "klass" [omission in API data]';
  } else if (content.gear.flat[key].klass === 'armoire') {
    setType = 'Armoire set';
  } else if (content.gear.flat[key].klass === 'mystery') {
    setType = 'Mystery Items';
    setName = setName.replace(/mystery-(....)(..)/, '$1-$2');
  } else if (content.gear.flat[key].klass === 'special') {
    const specialClass = content.gear.flat[key].specialClass || '';
    if (specialClass && Object.keys(klassNames).includes(specialClass)) {
      setType = `Grand Gala ${klassNames[specialClass]} set`;
    } else if (key.includes('special_gaymerx')) {
      setType = 'GaymerX';
      wantSetName = false;
    } else if (key.includes('special_ks2019')) {
      setType = '<a href="https://habitica.fandom.com/wiki/Kickstarter">Kickstarter 2019</a>';
      wantSetName = false;
    } else {
      setType = '[unknown set]';
      wantSetName = false;
    }
  } else if (Object.keys(klassNames).includes(content.gear.flat[key].klass)) {
    // e.g., base class gear such as weapon_warrior_6 (Golden Sword)
    setType = `base ${klassNames[content.gear.flat[key].klass]} gear`;
    wantSetName = false;
  }
  return (wantSetName) ? `${setType}: ${setName}` : setType;
}


export default {
  data () {
    return {
      content,
    };
  },
  methods: {
    getItemDescription (itemType, key) {
      // Returns item name. Also returns other info for equipment.

      const simpleItemTypes = ['eggs', 'hatchingPotions', 'food', 'quests', 'special'];
      if (simpleItemTypes.includes(itemType) && content[itemType][key]) {
        return content[itemType][key].text();
      }

      if (itemType === 'mounts' && content.mountInfo[key]) {
        return content.mountInfo[key].text();
      }

      if (itemType === 'pets' && content.petInfo[key]) {
        return content.petInfo[key].text();
      }

      if (itemType === 'gear' && content.gear.flat[key]) {
        const name = content.gear.flat[key].text();
        const description = _getGearSetDescription(key);
        if (description) return `${name} -- ${description}`;
        return name;
      }

      return 'NO NAME - invalid item?';
    },
  },
};
