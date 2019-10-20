import i18n from '../i18n';

export default function markPmsRead (user) {
  user.inbox.newMessages = 0;

  return [
    user.inbox.newMessages,
    i18n.t('pmsMarkedRead'),
  ];
}
