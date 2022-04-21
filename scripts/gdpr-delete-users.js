/* eslint-disable no-console, import/no-commonjs */
import axios from 'axios'; // eslint-disable-line import/no-extraneous-dependencies
import nconf from 'nconf';
import { model as User } from '../website/server/models/user';

const AMPLITUDE_KEY = nconf.get('AMPLITUDE_KEY');
const AMPLITUDE_SECRET = nconf.get('AMPLITUDE_SECRET');
const BASE_URL = nconf.get('BASE_URL');

async function deleteAmplitudeData (userId, email) {
  const response = await axios.post(
    'https://amplitude.com/api/2/deletions/users',
    {
      user_ids: userId, // eslint-disable-line camelcase
      requester: email,
    },
    {
      auth: {
        username: AMPLITUDE_KEY,
        password: AMPLITUDE_SECRET,
      },
    },
  ).catch(err => {
    console.log(err.response.data);
  });

  if (response) {
    if (response.status === 200) {
      console.log(`${userId} (${email}) Amplitude deletion request OK.`);
    } else {
      console.log(`${userId} (${email}) Amplitude response: ${response.status} ${response.statusText}`);
    }
  }
}

async function deleteHabiticaData (user, email) {
  const set = {
    'auth.blocked': false,
    'auth.local.hashed_password': '$2a$10$QDnNh1j1yMPnTXDEOV38xOePEWFd4X8DSYwAM8XTmqmacG5X0DKjW',
    'auth.local.passwordHashMethod': 'bcrypt',
  };
  if (!user.auth.local.email) set['auth.local.email'] = `${user._id}@example.com`;
  await User.updateOne(
    { _id: user._id },
    { $set: set },
  );
  await new Promise(resolve => setTimeout(resolve, 1000));
  const response = await axios.delete(
    `${BASE_URL}/api/v3/user`,
    {
      data: {
        password: 'test',
      },
      headers: {
        'x-api-user': user._id,
        'x-api-key': user.apiToken,
      },
    },
  ).catch(err => {
    console.log(err.response.data);
  });

  if (response) {
    if (response.status === 200) {
      console.log(`${user._id} (${email}) removed from Habitica. Last login: ${user.auth.timestamps.loggedin}`);
    } else {
      console.log(`${user._id} (${email}) Habitica response: ${response.status} ${response.statusText}`);
    }
  }
}

async function processEmailAddress (email) {
  const emailRegex = new RegExp(`^${email}$`, 'i');
  const localUsers = await User.find(
    { 'auth.local.email': emailRegex },
    { _id: 1, apiToken: 1, auth: 1 },
  ).exec();

  const socialUsers = await User.find(
    {
      'auth.local.email': { $not: emailRegex },
      $or: [
        { 'auth.facebook.emails.value': email },
        { 'auth.google.emails.value': email },
        { 'auth.apple.emails.value': email },
      ],
    },
    { _id: 1, apiToken: 1, auth: 1 },
  ).collation(
    { locale: 'en', strength: 1 },
  ).exec();

  const users = localUsers.concat(socialUsers);

  if (users.length < 1) {
    return console.log(`No users found with email address ${email}`);
  }

  await new Promise(resolve => setTimeout(resolve, 1000));
  return Promise.all(users.map(user => (async () => {
    await deleteAmplitudeData(user._id, email); // eslint-disable-line no-await-in-loop
    await deleteHabiticaData(user, email); // eslint-disable-line no-await-in-loop
  })()));
}

export default function deleteUserData (emails) {
  const emailPromises = emails.map(processEmailAddress);
  return Promise.all(emailPromises);
}
