/* eslint-disable no-console */
import axios from 'axios';
import { model as User } from '../website/server/models/user';
import nconf from 'nconf';

const AMPLITUDE_KEY = nconf.get('AMPLITUDE_KEY');
const AMPLITUDE_SECRET = nconf.get('AMPLITUDE_SECRET');
const BASE_URL = nconf.get('BASE_URL');

async function _deleteAmplitudeData (userId, email) {
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
    }
  );

  console.log(`${response.status} ${response.statusText}`);
}

async function _deleteHabiticaData (user) {
  await User.update(
    {_id: user._id},
    {$set: {
      'auth.local.passwordHashMethod': 'bcrypt',
      'auth.local.hashed_password': '$2a$10$QDnNh1j1yMPnTXDEOV38xOePEWFd4X8DSYwAM8XTmqmacG5X0DKjW',
    }}
  );
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
    }
  );

  console.log(`${response.status} ${response.statusText}`);
  if (response.status === 200) console.log(`${user._id} removed. Last login: ${user.auth.timestamps.loggedin}`);
}

async function _processEmailAddress (email) {
  const emailRegex = new RegExp(`^${email}`, 'i');
  const users = await User.find({
    $or: [
      {'auth.local.email': emailRegex},
      {'auth.facebook.emails.value': emailRegex},
      {'auth.google.emails.value': emailRegex},
    ]},
  {
    _id: 1,
    apiToken: 1,
    auth: 1,
  }).exec();

  if (users.length < 1) {
    console.warn(`No users found with email address ${email}`);
  } else {
    const habiticaPromises = users.map(_deleteHabiticaData);
    const amplitudePromises = users.map(
      function processAmplitude (u) {
        return _deleteAmplitudeData(u._id, email);
      }
    );
    const allPromises = amplitudePromises.concat(habiticaPromises);
    return Promise.all(allPromises);
  }
}

function deleteUserData (emails) {
  const emailPromises = emails.map(_processEmailAddress);
  return Promise.all(emailPromises);
}

module.exports = deleteUserData;
