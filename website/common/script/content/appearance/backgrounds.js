import forOwn from 'lodash/forOwn';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';
import t from '../translation';

/* eslint-disable camelcase */
const backgrounds = {
  backgrounds062014: {
    beach: { },
    fairy_ring: { },
    forest: { },
  },
  backgrounds072014: {
    open_waters: { },
    coral_reef: { },
    seafarer_ship: { },
  },
  backgrounds082014: {
    volcano: { },
    clouds: { },
    dusty_canyons: { },
  },
  backgrounds092014: {
    thunderstorm: { },
    autumn_forest: { },
    harvest_fields: { },
  },
  backgrounds102014: {
    graveyard: { },
    haunted_house: { },
    pumpkin_patch: { },
  },
  backgrounds112014: {
    harvest_feast: { },
    sunset_meadow: { },
    starry_skies: { },
  },
  backgrounds122014: {
    iceberg: { },
    twinkly_lights: { },
    south_pole: { },
  },
  backgrounds012015: {
    ice_cave: { },
    frigid_peak: { },
    snowy_pines: { },
  },
  backgrounds022015: {
    blacksmithy: { },
    crystal_cave: { },
    distant_castle: { },
  },
  backgrounds032015: {
    spring_rain: { },
    stained_glass: { },
    rolling_hills: { },
  },
  backgrounds042015: {
    cherry_trees: { },
    floral_meadow: { },
    gumdrop_land: { },
  },
  backgrounds052015: {
    marble_temple: { },
    mountain_lake: { },
    pagodas: { },
  },
  backgrounds062015: {
    drifting_raft: { },
    shimmery_bubbles: { },
    island_waterfalls: { },
  },
  backgrounds072015: {
    dilatory_ruins: { },
    giant_wave: { },
    sunken_ship: { },
  },
  backgrounds082015: {
    pyramids: { },
    sunset_savannah: { },
    twinkly_party_lights: { },
  },
  backgrounds092015: {
    market: { },
    stable: { },
    tavern: { },
  },
  backgrounds102015: {
    harvest_moon: { },
    slimy_swamp: { },
    swarming_darkness: { },
  },
  backgrounds112015: {
    floating_islands: { },
    night_dunes: { },
    sunset_oasis: { },
  },
  backgrounds122015: {
    alpine_slopes: { },
    snowy_sunrise: { },
    winter_town: { },
  },
  backgrounds012016: {
    frozen_lake: { },
    snowman_army: { },
    winter_night: { },
  },
  backgrounds022016: {
    bamboo_forest: { },
    cozy_library: { },
    grand_staircase: { },
  },
  backgrounds032016: {
    deep_mine: { },
    rainforest: { },
    stone_circle: { },
  },
  backgrounds042016: {
    archery_range: { },
    giant_florals: {
      text: t('backgroundGiantFlowersText'),
      notes: t('backgroundGiantFlowersNotes'),
    },
    rainbows_end: { },
  },
  backgrounds052016: {
    beehive: { },
    gazebo: { },
    tree_roots: { },
  },
  backgrounds062016: {
    lighthouse_shore: { },
    lilypad: { },
    waterfall_rock: { },
  },
  backgrounds072016: {
    aquarium: { },
    dilatory_castle: { },
    deep_sea: { },
  },
  backgrounds082016: {
    idyllic_cabin: { },
    mountain_pyramid: { },
    stormy_ship: { },
  },
  backgrounds092016: {
    cornfields: { },
    farmhouse: { },
    orchard: { },
  },
  backgrounds102016: {
    rainy_city: { },
    spider_web: { },
    strange_sewers: { },
  },
  backgrounds112016: {
    midnight_clouds: { },
    stormy_rooftops: { },
    windy_autumn: { },
  },
  backgrounds122016: {
    shimmering_ice_prism: { },
    winter_fireworks: { },
    winter_storefront: { },
  },
  backgrounds012017: {
    blizzard: { },
    sparkling_snowflake: { },
    stoikalm_volcanoes: { },
  },
  backgrounds022017: {
    bell_tower: { },
    treasure_room: { },
    wedding_arch: { },
  },
  backgrounds032017: {
    magic_beanstalk: { },
    meandering_cave: { },
    mistiflying_circus: { },
  },
  backgrounds042017: {
    bug_covered_log: { },
    giant_birdhouse: { },
    mist_shrouded_mountain: { },
  },
  backgrounds052017: {
    guardian_statues: { },
    habit_city_streets: { },
    on_tree_branch: {
      text: t('backgroundOnATreeBranchText'),
      notes: t('backgroundOnATreeBranchNotes'),
    },
  },
  backgrounds062017: {
    buried_treasure: { },
    ocean_sunrise: { },
    sandcastle: { },
  },
  backgrounds072017: {
    giant_seashell: { },
    kelp_forest: { },
    midnight_lake: { },
  },
  backgrounds082017: {
    back_of_giant_beast: { },
    desert_dunes: { },
    summer_fireworks: { },
  },
  backgrounds092017: {
    beside_well: { },
    garden_shed: { },
    pixelists_workshop: { },
  },
  backgrounds102017: {
    magical_candles: { },
    spooky_hotel: { },
    tar_pits: { },
  },
  backgrounds112017: {
    fiber_arts_room: { },
    midnight_castle: { },
    tornado: { },
  },
  backgrounds122017: {
    crosscountry_ski_trail: { },
    starry_winter_night: { },
    toymakers_workshop: { },
  },
  backgrounds012018: {
    aurora: { },
    driving_a_sleigh: { },
    flying_over_icy_steppes: { },
  },
  backgrounds022018: {
    chessboard_land: { },
    magical_museum: { },
    rose_garden: { },
  },
  backgrounds032018: {
    driving_a_coach: { },
    elegant_balcony: { },
    gorgeous_greenhouse: { },
  },
  backgrounds042018: {
    flying_over_an_ancient_forest: {
      text: t('backgroundFlyingOverAncientForestText'),
      notes: t('backgroundFlyingOverAncientForestNotes'),
    },
    flying_over_a_field_of_wildflowers: {
      text: t('backgroundFlyingOverWildflowerFieldText'),
      notes: t('backgroundFlyingOverWildflowerFieldNotes'),
    },
    tulip_garden: { },
  },
  backgrounds052018: {
    champions_colosseum: { },
    fantastical_shoe_store: { },
    terraced_rice_field: { },
  },
  backgrounds062018: {
    at_the_docks: {
      text: t('backgroundDocksText'),
      notes: t('backgroundDocksNotes'),
    },
    rowboat: { },
    pirate_flag: { },
  },
  backgrounds072018: {
    dark_deep: { },
    dilatory_city: { },
    tide_pool: { },
  },
  backgrounds082018: {
    training_grounds: { },
    flying_over_rocky_canyon: { },
    bridge: { },
  },
  backgrounds092018: {
    apple_picking: { },
    giant_book: { },
    cozy_barn: { },
  },
  backgrounds102018: {
    bayou: { },
    creepy_castle: { },
    dungeon: { },
  },
  backgrounds112018: {
    back_alley: { },
    glowing_mushroom_cave: { },
    cozy_bedroom: { },
  },
  backgrounds122018: {
    flying_over_snowy_mountains: { },
    frosty_forest: { },
    snowy_day_fireplace: { },
  },
  backgrounds012019: {
    avalanche: { },
    archaeological_dig: { },
    scribes_workshop: { },
  },
  backgrounds022019: {
    medieval_kitchen: { },
    old_fashioned_bakery: { },
    valentines_day_feasting_hall: { },
  },
  backgrounds032019: {
    duck_pond: { },
    field_with_colored_eggs: { },
    flower_market: { },
  },
  backgrounds042019: {
    halflings_house: { },
    blossoming_desert: { },
    birch_forest: { },
  },
  backgrounds052019: {
    dojo: { },
    park_with_statue: { },
    rainbow_meadow: { },
  },
  backgrounds062019: {
    school_of_fish: { },
    seaside_cliffs: { },
    underwater_vents: { },
  },
  backgrounds072019: {
    lake_with_floating_lanterns: { },
    flying_over_tropical_islands: { },
    among_giant_anemones: { },
  },
  backgrounds082019: {
    amid_ancient_ruins: { },
    giant_dandelions: { },
    treehouse: { },
  },
  backgrounds092019: {
    autumn_flower_garden: { },
    in_an_ancient_tomb: { },
    in_a_classroom: { },
  },
  backgrounds102019: {
    foggy_moor: { },
    monster_makers_workshop: { },
    pumpkin_carriage: { },
  },
  backgrounds112019: {
    farmers_market: { },
    flying_in_a_thunderstorm: { },
    potion_shop: { },
  },
  backgrounds122019: {
    holiday_market: { },
    holiday_wreath: { },
    winter_nocturne: { },
  },
  backgrounds012020: {
    birthday_party: { },
    desert_with_snow: { },
    snowglobe: { },
  },
  backgrounds022020: {
    elegant_ballroom: { },
    hall_of_heroes: { },
    tea_party: { },
  },
  backgrounds032020: {
    among_giant_flowers: { },
    butterfly_garden: { },
    succulent_garden: { },
  },
  backgrounds042020: {
    animal_clouds: { },
    heather_field: { },
    rainy_barnyard: { },
  },
  backgrounds052020: {
    habit_city_rooftops: { },
    hot_air_balloon: { },
    strawberry_patch: { },
  },
  backgrounds062020: {
    relaxation_river: { },
    salt_lake: { },
    viking_ship: { },
  },
  backgrounds072020: {
    beach_cabana: { },
    swimming_among_jellyfish: { },
    underwater_ruins: { },
  },
  timeTravelBackgrounds: {
    airship: {
      price: 1,
      currency: 'hourglasses',
    },
    clocktower: {
      price: 1,
      currency: 'hourglasses',
    },
    steamworks: {
      price: 1,
      currency: 'hourglasses',
    },
  },
  incentiveBackgrounds: {
    violet: {
      currency: 'loginIncentive',
    },
    blue: {
      currency: 'loginIncentive',
    },
    green: {
      currency: 'loginIncentive',
    },
    purple: {
      currency: 'loginIncentive',
    },
    red: {
      currency: 'loginIncentive',
    },
    yellow: {
      currency: 'loginIncentive',
    },
  },
};
/* eslint-enable quote-props */

const flat = {};

forOwn(backgrounds, (backgroundsInSet, set) => {
  forOwn(backgroundsInSet, (background, bgKey) => {
    background.key = bgKey;
    background.set = set;
    background.price = background.price || 7;
    background.text = background.text || t(`background${upperFirst(camelCase(bgKey))}Text`);
    background.notes = background.notes || t(`background${upperFirst(camelCase(bgKey))}Notes`);

    flat[bgKey] = background;
  });
});

export default backgrounds;

export function backgroundsTree () {
  return backgrounds;
}

export function backgroundsFlat () {
  return flat;
}
