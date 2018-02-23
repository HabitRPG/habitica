import nconf from 'nconf';

const CHAT_APPROVAL_REQUIRED = nconf.get('CHAT_APPROVAL_REQUIRED');

let api = {};

api.isChatApprovalRequired = function isChatApprovalRequired () {
  return CHAT_APPROVAL_REQUIRED === 'true';
};

module.exports = api;
