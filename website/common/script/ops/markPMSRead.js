import i18n from '../i18n';

module.exports = function markPmsRead (user, count) {
  user.inbox.newMessages -= count;

  return [
    user.inbox.newMessages,
    i18n.t('pmsMarkedRead'),
  ];
};
