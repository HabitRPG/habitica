import monk from 'monk';
import nconf from 'nconf';
import axios from 'axios';

const CONNECTION_STRING = nconf.get('MIGRATION_CONNECT_STRING');
const MIGRATION_NAME = '20181002_username_email';

const BASE_URL = nconf.get('BASE_URL');
const EMAIL_SERVER_URL = nconf.get('EMAIL_SERVER:url');
const EMAIL_SERVER_USER = nconf.get('EMAIL_SERVER:authUser');
const EMAIL_SERVER_PASSWORD = nconf.get('EMAIL_SERVER:authPassword');

let dbUsers = monk(CONNECTION_STRING).get('users', { castIds: false });

function sendEmails() {
  dbUsers.find(
    {migration: {$ne: MIGRATION_NAME}},
    {fields: {_id: 1, auth: 1, profile: 1, preferences: 1}}
  ).each((user, {close, pause, resume}) => {
    pause();
    dbUsers.update({_id: user._id}, {$set: {migration: MIGRATION_NAME}});
    return axios.post(
      `${EMAIL_SERVER_URL}/job`, {
          type: 'email',
          data: {
            emailType: 'username-change',
            to: [
              {name: user.profile.name, email: user.auth.local.email}
            ],
            variables: [
              {name: 'BASE_URL', content: BASE_URL},
              {name: 'LOGIN_NAME', content: user.auth.local.username},
              {name: 'UNSUB_EMAIL_TYPE_URL', content: '/user/settings/notifications?unsubFrom=importantAnnouncements'},
            ],
          },
          options: {
            priority: 'high',
            attempts: 5,
            backoff: {delay: 10 * 60 * 1000, type: 'fixed'},
          },
        },
        {
          auth: {
            username: EMAIL_SERVER_USER,
            password: EMAIL_SERVER_PASSWORD,
          },
        }
    ).then(() => {
      resume();
    }).catch((error) => {
      console.log(error);
    });
  }).then(() => {
    return process.exit(0);
  });
}

module.exports = sendEmails;
