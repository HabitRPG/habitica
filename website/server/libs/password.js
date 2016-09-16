// Utilities for working with passwords
import crypto from 'crypto';

// Return the encrypted version of a password (using sha1) given a salt
export function encrypt (password, salt) {
  return crypto
          .createHmac('sha1', salt)
          .update(password)
          .digest('hex');
}

// Create a salt, default length is 10
export function makeSalt (len = 10) {
  return crypto
          .randomBytes(Math.ceil(len / 2))
          .toString('hex')
          .substring(0, len);
}
