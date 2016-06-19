import i18n from '../i18n';

module.exports = function markPmsRead (user, req = {}) {
  user.inbox.newMessages = 0;

  if (req.v2 === true) {
    return user;
  } else {
    return [
      user.inbox.newMessages,
      i18n.t('pmsMarkedRead'),
    ];
  }
};
