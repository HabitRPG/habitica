// A map of messages used by the API/App that don't need to be translated and
// so are not placed into /common/locales

import _clone from 'lodash/clone';
import _template from 'lodash/template';

// When this file grows, it can be split into multiple ones.
const messages = {
  invalidAttribute: '"<%= attr %>" is not a valid Stat.',

  statsObjectRequired: '"stats" update is required',

  missingTypeParam: '"req.params.type" is required.',
  missingKeyParam: '"req.params.key" is required.',
  itemNotFound: 'Item "<%= key %>" not found.',
  questNotFound: 'Quest "<%= key %>" not found.',
  spellNotFound: 'Skill "<%= spellId %>" not found.',
  invalidTypeEquip: '"type" must be one of "equipped", "pet", "mount", "costume"',
  missingPetFoodFeed: '"pet" and "food" are required parameters.',
  missingEggHatchingPotion: '"egg" and "hatchingPotion" are required parameters.',

  invalidPetName: 'Invalid pet name supplied.',
  invalidFoodName: 'Invalid food name supplied.',

};

export default function (msgKey, vars = {}) {
  let message = messages[msgKey];
  if (!message) throw new Error(`Error processing the common message "${msgKey}".`);

  let clonedVars = vars ? _clone(vars) : {};

  // TODO cache the result of template() ? More memory usage, faster output
  return _template(message)(clonedVars);
}
