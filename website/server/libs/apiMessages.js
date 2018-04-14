// A map of messages used by the API that don't need to be translated and
// so are not placed into /common/locales

import _ from 'lodash';

// When this file grows, it can be split into multiple ones.
const messages = {
  taskIdRequired: 'req.params.taskId must contain a task id.',
  keepOrRemove: 'req.query.keep must be either "keep" or "remove".',
  keepOrRemoveAll: 'req.query.keep must be either "keep-all" or "remove-all".',
  invalidAttribute: '"<%= attr %>" is not a valid Stat.',

  statsObjectRequired: '"stats" update is required',
  queryPageInteger: 'req.query.page must be an integer greater than or equal to 0.',

  missingTypeParam: '"req.params.type" is required.',
  missingKeyParam: '"req.params.key" is required.',
  itemNotFound: 'Item "<%= key %>" not found.',
  questNotFound: 'Quest "<%= key %>" not found.',
  spellNotFound: 'Skill "<%= spellId %>" not found.',
  missingTypeKeyEquip: '"key" and "type" are required parameters.',
  invalidTypeEquip: '"type" must be one of "equipped", "pet", "mount", "costume"',
  missingPetFoodFeed: '"pet" and "food" are required parameters.',
  missingEggHatchingPotion: '"egg" and "hatchingPotion" are required parameters.',

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

export default function (msgKey, vars = {}) {
  let message = messages[msgKey];
  if (!message) throw new Error(`Error processing the API message "${msgKey}".`);

  let clonedVars = vars ? _.clone(vars) : {};

  // TODO cache the result of template() ? More memory usage, faster output
  return _.template(message)(clonedVars);
}
