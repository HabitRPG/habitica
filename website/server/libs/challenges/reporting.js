import nconf from 'nconf';
import { getUserInfo, sendTxn, getGroupUrl } from '../email';

const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map((email) => {
  return { email, canSend: true };
});

export async function notifyOfFlaggedChallenge (challenge, user) {
  const reporterEmailContent = getUserInfo(user, ['email']).email;

  const emailVariables = [
    {name: 'CHALLENGE_NAME', content: challenge.name},
    {name: 'CHALLENGE_ID', content: challenge._id},

    {name: 'REPORTER_USERNAME', content: user.profile.name},
    {name: 'REPORTER_UUID', content: user._id},
    {name: 'REPORTER_EMAIL', content: reporterEmailContent},
    {name: 'REPORTER_MODAL_URL', content: `/static/front/#?memberId=${user._id}`},

    {name: 'AUTHOR_UUID', content: challenge.leader._id},
    {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${challenge.leader._id}`},
  ];

  sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods', emailVariables);
}

export async function clearFlags (challenge, user) {
  challenge.flagCount = 0;
  await challenge.save();

  const adminEmailContent = getUserInfo(user, ['email']).email;
  const challengeUrl = `/challenges/${challenge._id}`;

  const groupUrl = getGroupUrl({ _id: challenge.group });

  sendTxn(FLAG_REPORT_EMAILS, 'unflag-report-to-mods', [
    {name: 'ADMIN_USERNAME', content: user.profile.name},
    {name: 'ADMIN_UUID', content: user._id},
    {name: 'ADMIN_EMAIL', content: adminEmailContent},
    {name: 'ADMIN_MODAL_URL', content: `/static/front/#?memberId=${user._id}`},

    {name: 'AUTHOR_UUID', content: challenge.leader},
    {name: 'AUTHOR_EMAIL', content: adminEmailContent},
    {name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${challenge.leader}`},

    {name: 'CHALLENGE_NAME', content: challenge.name},
    {name: 'CHALLENGE_ID', content: challenge._id},
    {name: 'CHALLENGE_URL', content: challengeUrl},

    {name: 'GROUP_URL', content: groupUrl},
  ]);
}
