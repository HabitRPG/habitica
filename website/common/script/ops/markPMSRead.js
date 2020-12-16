import i18n from '../i18n';

export default function markPmsRead (user, count) {
  user.inbox.newMessages -= count;

  return [
    user.inbox.newMessages,
    i18n.t('pmsMarkedRead'),
  ];
}
