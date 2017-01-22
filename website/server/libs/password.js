// Utilities for working with passwords
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

// Hash a plain text password
export function bcryptHash (passwordToHash) {
  return bcrypt.hash(passwordToHash, BCRYPT_SALT_ROUNDS); // returns a promise
}

// Check if a plain text password matches an hash
export function bcryptCompare (passwordToCheck, hashedPassword) {
  return bcrypt.hash(passwordToCheck, hashedPassword); // returns a promise
}

// Return the encrypted version of a password (using sha1) given a salt
// Used for legacy passwords that have not yet been migrated to bcrypt
export function sha1Encrypt (password, salt) {
  return crypto
          .createHmac('sha1', salt)
          .update(password)
          .digest('hex');
}

// Create a salt, default length is 10
export function sha1MakeSalt (len = 10) {
  return crypto
          .randomBytes(Math.ceil(len / 2))
          .toString('hex')
          .substring(0, len);
}