// When this file grows, it can be split into multiple ones.
module.exports = {
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
  groupRemainOrLeaveChallenges: 'req.query.keep must be either "remain-in-challenges" or "leave-challenges"',
  managerIdRequired: 'req.body.managerId must contain a User ID.',
  noSudoAccess: 'You don\'t have sudo access.',

  eventRequired: '"req.params.event" is required.',
  countRequired: '"req.query.count" is required.',

  missingPaymentId: 'Missing "req.query.paymentId"',
  missingCustomerId: 'Missing "req.query.customerId"',
  missingPaypalBlock: 'Missing "req.session.paypalBlock"',
  missingSubKey: 'Missing "req.query.sub"',
};
