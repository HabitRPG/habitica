// When this file grows, it can be split into multiple ones.
module.export = {
  // common libs/ops error messages
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

  // api error messages
  taskIdRequired: 'req.params.taskId must contain a task id.',
  keepOrRemove: 'req.query.keep must be either "keep" or "remove".',
  keepOrRemoveAll: 'req.query.keep must be either "keep-all" or "remove-all".',

  queryPageInteger: 'req.query.page must be an integer greater than or equal to 0.',

  missingTypeKeyEquip: '"key" and "type" are required parameters.',

  guildsOnlyPaginate: 'Only public guilds support pagination.',
  guildsPaginateBooleanString: 'req.query.paginate must be a boolean string.',
  groupIdRequired: 'req.params.groupId must contain a groupId.',
  groupRemainOrLeaveChallenges: 'req.query.keep must be either "remain-in-challenges" or "leave-challenges"',
  managerIdRequired: 'req.body.managerId must contain a user ID.',
  noSudoAccess: 'You don\'t have sudo access.',

  eventRequired: '"req.params.event" is required.',
  countRequired: '"req.query.count" is required.',

  missingPaymentId: 'Missing "req.query.paymentId"',
  missingCustomerId: 'Missing "req.query.customerId"',
  missingPaypalBlock: 'Missing "req.session.paypalBlock"',
  missingSubKey: 'Missing "req.query.sub"',
};
