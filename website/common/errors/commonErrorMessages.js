// When this file grows, it can be split into multiple ones.
module.export = {
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
