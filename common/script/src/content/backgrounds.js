import {each} from 'lodash';
import camelCase from 'lodash.camelCase';
import capitalize from 'lodash.capitalize';
import t from './helpers/translator';

let sets = {
  '062014': ['beach', 'fairy_ring', 'forest'],
  '072014': ['open_waters', 'coral_reef', 'seafarer_ship'],
  '082014': ['volcano', 'clouds', 'dusty_canyons'],
  '092014': ['thunderstorm', 'autumn_forest', 'harvest_fields'],
  '102014': ['graveyard', 'haunted_house', 'pumpkin_patch'],
  '112014': ['harvest_feast', 'sunset_meadow', 'starry_skies'],
  '122014': ['iceberg', 'twinkly_lights', 'south_pole'],
  '012015': ['ice_cave', 'frigid_peak', 'snowy_pines'],
  '022015': ['blacksmithy', 'crystal_cave', 'distant_castle'],
  '032015': ['spring_rain', 'stained_glass', 'rolling_hills'],
  '042015': ['cherry_trees', 'floral_meadow', 'gumdrop_land'],
  '052015': ['marble_temple', 'mountain_lake', 'pagodas'],
  '062015': ['drifting_raft', 'shimmery_bubbles', 'island_waterfalls'],
  '072015': ['dilatory_ruins', 'giant_wave', 'sunken_ship'],
  '082015': ['pyramids', 'sunset_savannah', 'twinkly_party_lights'],
  '092015': ['market', 'stable', 'tavern'],
};

let backgrounds = { };

each(sets, (names, set) => {
  let setName = `backgrounds${set}`;
  backgrounds[setName] = {};

  each(names, (name) => {
    let capitalCamelName = capitalize(camelCase(name));

    backgrounds[setName][name] = {
      text: t(`background${capitalCamelName}Text`),
      notes: t(`background${capitalCamelName}Notes`),
    };
  });
});

export default backgrounds;
