import {
  createCipher,
  createDecipher,
} from 'crypto';
import nconf from 'nconf';

const algorithm = 'aes-256-ctr';
const SESSION_SECRET = nconf.get('SESSION_SECRET');

export function encrypt (text) {
  let cipher = createCipher(algorithm,  SESSION_SECRET);
  let crypted = cipher.update(text, 'utf8', 'hex');

  crypted += cipher.final('hex');
  return crypted;
}

export function decrypt (text) {
  let decipher = createDecipher(algorithm, SESSION_SECRET);
  let dec = decipher.update(text, 'hex', 'utf8');

  dec += decipher.final('utf8');
  return dec;
}
