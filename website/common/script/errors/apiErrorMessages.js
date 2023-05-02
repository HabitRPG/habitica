// When this file grows, it can be split into multiple ones.
export default {
  taskIdRequired: 'req.params.taskId must contain a task id.',
  keepOrRemove: 'req.query.keep must be either "keep" or "remove".',
  keepOrRemoveAll: 'req.query.keep must be either "keep-all" or "remove-all".',

  queryPageInteger: 'req.query.page must be an integer greater than or equal to 0.',

  missingTypeKeyEquip: '"key" and "type" are required parameters.',

  chatIdRequired: 'req.params.chatId must contain a chatId.',
  messageIdRequired: 'req.params.messageId must contain a message ID.',

  guildsOnlyPaginate: 'Only public guilds support pagination.',
  guildsPaginateBooleanString: 'req.query.paginate must be a boolean string.',
  groupIdRequired: 'req.params.groupId must contain a groupId.',
  groupWithIDNotFound: 'Group with id "<%= groupId %>" not found.',
  groupRemainOrLeaveChallenges: 'req.query.keep must be either "remain-in-challenges" or "leave-challenges"',
  managerIdRequired: 'req.body.managerId must contain a User ID.',
  noPrivAccess: 'You don\'t have the required privileges.',
  notPartyLeader: 'You are not the leader of a Party.',

  eventRequired: '"req.params.event" is required.',
  countRequired: '"req.query.count" is required.',

  missingPaymentId: 'Missing "req.query.paymentId"',
  missingCustomerId: 'Missing "req.query.customerId"',
  missingPaypalBlock: 'Missing "req.session.paypalBlock"',
  missingSubKey: 'Missing "req.query.sub"',
  invalidGemsBlock: 'The supplied gemsBlock does not exists',

  postIdRequired: '"postId" must be a valid UUID.',
  noNewsPosterAccess: 'You don\'t have news poster access.',

  ipAddressBlocked: 'Your access to Habitica has been blocked. This may be due to a breach of our Terms of Service or for other reasons. For details or to ask to be unblocked, please email admin@habitica.com or ask your parent or guardian to email them. Include your Habitica @Username or User Id in the email if you know it.',
  clientRateLimited: 'This User ID or IP address has been rate limited due to an excess amount of requests to the Habitica API v3. More info can be found in the response headers and at https://habitica.fandom.com/wiki/Guidance_for_Comrades#Rules_for_Third-Party_Tools under the section Rate Limiting.',

  invalidPlatform: 'Invalid platform specified',

  directionUpDown: '"direction" is required and must be "up" or "down".',
  invalidTaskIdentifier: 'A task is identified by its UUID or alias.',
  invalidTaskScorings: 'This API route expects a body in the form of [{id, direction}].',
  summaryLengthExceedsMax: 'Summary length is too high.',
};
