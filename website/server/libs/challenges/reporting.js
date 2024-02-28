import nconf from 'nconf';
import { getUserInfo, sendTxn, getGroupUrl } from '../email';
import { NotFound } from '../errors';
import * as slack from '../slack';

const FLAG_REPORT_EMAILS = nconf.get('FLAG_REPORT_EMAIL').split(',').map(email => ({ email, canSend: true }));

export async function notifyOfFlaggedChallenge (challenge, user, userComment) {
  const reporterEmailContent = getUserInfo(user, ['email']).email;

  const emailVariables = [
    { name: 'CHALLENGE_NAME', content: challenge.name },
    { name: 'CHALLENGE_ID', content: challenge._id },

    { name: 'REPORTER_USERNAME', content: user.profile.name },
    { name: 'REPORTER_UUID', content: user._id },
    { name: 'REPORTER_EMAIL', content: reporterEmailContent },
    { name: 'REPORTER_MODAL_URL', content: `/static/front/#?memberId=${user._id}` },
    { name: 'REPORTER_COMMENT', content: userComment || '' },

    { name: 'AUTHOR_UUID', content: challenge.leader._id },
    { name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${challenge.leader._id}` },
  ];

  sendTxn(FLAG_REPORT_EMAILS, 'flag-report-to-mods', emailVariables);

  slack.sendChallengeFlagNotification({
    flagger: user,
    challenge,
    userComment,
  });
}

export async function flagChallenge (challenge, user, res) {
  if (challenge.flags[user._id] && !user.contributor.admin) throw new NotFound(res.t('messageChallengeFlagAlreadyReported'));
  if (challenge.official) throw new NotFound(res.t('messageChallengeFlagOfficial'));

  challenge.flags[user._id] = true;
  challenge.markModified('flags');

  if (user.contributor.admin) {
    // Arbitrary amount, higher than 2
    challenge.flagCount = 5;
  } else {
    challenge.flagCount += 1;
  }

  await challenge.save();
}

export async function clearFlags (challenge, user) {
  challenge.flagCount = 0;
  if (user.contributor.admin) { // let's get this to a proper "permissions" check later
    challenge.flags = {};
    challenge.markModified('flags');
  } else if (challenge.flags[user._id]) {
    challenge.flags[user._id] = false;
    challenge.markModified('flags');
  }
  await challenge.save();

  const adminEmailContent = getUserInfo(user, ['email']).email;
  const challengeUrl = `/challenges/${challenge._id}`;

  const groupUrl = getGroupUrl({ _id: challenge.group, type: 'guild' });

  sendTxn(FLAG_REPORT_EMAILS, 'unflag-report-to-mods', [
    { name: 'ADMIN_USERNAME', content: user.profile.name },
    { name: 'ADMIN_UUID', content: user._id },
    { name: 'ADMIN_EMAIL', content: adminEmailContent },
    { name: 'ADMIN_MODAL_URL', content: `/static/front/#?memberId=${user._id}` },

    { name: 'AUTHOR_UUID', content: challenge.leader },
    { name: 'AUTHOR_EMAIL', content: adminEmailContent },
    { name: 'AUTHOR_MODAL_URL', content: `/static/front/#?memberId=${challenge.leader}` },

    { name: 'CHALLENGE_NAME', content: challenge.name },
    { name: 'CHALLENGE_ID', content: challenge._id },
    { name: 'CHALLENGE_URL', content: challengeUrl },

    { name: 'GROUP_URL', content: groupUrl },
  ]);
}
