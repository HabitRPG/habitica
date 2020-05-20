import each from 'lodash/each';
import content from '../content/index';

export default function resetGear (user) {
  const { gear } = user.items;

  each(['equipped', 'costume'], type => {
    gear[type] = {};
    gear[type].armor = 'armor_base_0';
    gear[type].weapon = 'weapon_warrior_0';
    gear[type].head = 'head_base_0';
    gear[type].shield = 'shield_base_0';
  });

  // Gear.owned is (was) a Mongo object so the _.each function iterates over hidden properties.
  // The content.gear.flat[k] check should prevent this causing an error
  each(gear.owned, (v, k) => {
    if (gear.owned[k] && content.gear.flat[k] && content.gear.flat[k].value) {
      gear.owned[k] = false;
    }
  });

  gear.owned.weapon_warrior_0 = true; // eslint-disable-line camelcase
  if (user.markModified) user.markModified('items.gear.owned');

  user.preferences.costume = false;
}
