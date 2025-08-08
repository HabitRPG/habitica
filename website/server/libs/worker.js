import got from 'got';
import nconf from 'nconf';
import logger from './logger';

const EMAIL_SERVER = {
  url: nconf.get('EMAIL_SERVER_URL'),
  auth: {
    user: nconf.get('EMAIL_SERVER_AUTH_USER'),
    password: nconf.get('EMAIL_SERVER_AUTH_PASSWORD'),
  },
};

export function sendJob (type, config) {
  const { data, options } = config;
  const usedOptions = {
    backoff: { delay: 10 * 60 * 1000, type: 'exponential' },
    ...options,
  };

  return got.post(`${EMAIL_SERVER.url}/job`, {
    retry: 5, // retry the http request to the email server 5 times
    timeout: 60000, // wait up to 60s before timing out
    username: EMAIL_SERVER.auth.user,
    password: EMAIL_SERVER.auth.password,
    json: {
      type,
      data,
      options: usedOptions,
    },
  }).json().catch(err => logger.error(err, {
    extraMessage: 'Error while sending an email.',
  }));
}
