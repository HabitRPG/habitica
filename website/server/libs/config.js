import nconf from 'nconf';

const CHAT_APPROVAL_REQUIRED = nconf.get('CHAT_APPROVAL_REQUIRED');
const CHAT_APPROVAL_DAYS = nconf.get('CHAT_APPROVAL_DAYS');

let api = {};

api.getChatApprovalDays = function getChatApprovalDays () {
  const parsed = parseInt(CHAT_APPROVAL_DAYS, 10);
  if (isNaN(parsed)) return 1;
  return parsed;
};

api.isChatApprovalRequired = function isChatApprovalRequired () {
  return CHAT_APPROVAL_REQUIRED === 'true';
};

module.exports = api;
