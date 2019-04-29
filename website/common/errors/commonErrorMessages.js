// When this file grows, it can be split into multiple ones.
module.exports = {
  invalidAttribute: '"<%= attr %>" is not a valid Stat.',

  statsObjectRequired: '"stats" object is required',

  missingTypeParam: '"req.params.type" is required.',
  missingKeyParam: '"req.params.key" is required.',
  itemNotFound: 'Item "<%= key %>" not found.',
  questNotFound: 'Quest "<%= key %>" not found.',
  spellNotFound: 'Skill "<%= spellId %>" not found.',
  invalidQuantity: 'Quantity to purchase must be a positive whole number.',
  invalidTypeEquip: '"type" must be one of "equipped", "pet", "mount", "costume"',
  missingPetFoodFeed: '"pet" and "food" are required parameters.',
  missingEggHatchingPotion: '"egg" and "hatchingPotion" are required parameters.',

  invalidPetName: 'Invalid pet name supplied.',
  invalidFoodName: 'Invalid food name supplied.',
};
