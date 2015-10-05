import {each} from 'lodash';
import {
  translator as t,
  generateBackgrounds
} from './helpers';

let sets = {
  'backgrounds062014': ['beach', 'fairy_ring', 'forest'],
  'backgrounds072014': ['open_waters', 'coral_reef', 'seafarer_ship'],
  'backgrounds082014': ['volcano', 'clouds', 'dusty_canyons'],
  'backgrounds092014': ['thunderstorm', 'autumn_forest', 'harvest_fields'],
  'backgrounds102014': ['graveyard', 'haunted_house', 'pumpkin_patch'],
  'backgrounds112014': ['harvest_feast', 'sunset_meadow', 'starry_skies'],
  'backgrounds122014': ['iceberg', 'twinkly_lights', 'south_pole'],
  'backgrounds012015': ['ice_cave', 'frigid_peak', 'snowy_pines'],
  'backgrounds022015': ['blacksmithy', 'crystal_cave', 'distant_castle'],
  'backgrounds032015': ['spring_rain', 'stained_glass', 'rolling_hills'],
  'backgrounds042015': ['cherry_trees', 'floral_meadow', 'gumdrop_land'],
  'backgrounds052015': ['marble_temple', 'mountain_lake', 'pagodas'],
  'backgrounds062015': ['drifting_raft', 'shimmery_bubbles', 'island_waterfalls'],
  'backgrounds072015': ['dilatory_ruins', 'giant_wave', 'sunken_ship'],
  'backgrounds082015': ['pyramids', 'sunset_savannah', 'twinkly_party_lights'],
  'backgrounds092015': ['market', 'stable', 'tavern'],
  'backgrounds102015': ['harvest_moon', 'slimy_swamp', 'swarming_darkness']
};

generateBackgrounds(sets);

export default sets;
