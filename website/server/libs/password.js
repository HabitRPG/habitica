// Utilities for working with passwords
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

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

// Compare the password for an user
// Works with bcrypt and sha1 indipendently
// An async function is used so that a promise is always returned
// even for comparing sha1 hashed passwords that use a sync method
export async function compare (user, passwordToCheck) {
  if (!user || !passwordToCheck) throw new Error('user and passwordToCheck are required parameters.');

  let isValidPassword;

  let passwordHashMethod = user.auth.local.passwordHashMethod;
  let passwordHash = user.auth.local.hashed_password;
  let passwordSalt = user.auth.local.salt; // Only used for SHA1

  if (passwordHashMethod === 'bcrypt') {
    isValidPassword = await bcryptCompare(passwordToCheck, passwordHash);
  // default to sha1 if the user has a salt but no passwordHashMethod
  } else if (passwordHashMethod === 'sha1' || !passwordHashMethod && passwordSalt) {
    isValidPassword = passwordHash === sha1Encrypt(passwordToCheck, passwordSalt);
  } else {
    throw new Error('Invalid password hash method.');
  }

  return isValidPassword;
}

// Convert an user to use bcrypt from sha1 for password hashing
// needs to save the user separately
export async function convertToBcrypt (user, plainTextPassword) {
  if (!user || !plainTextPassword) throw new Error('user and plainTextPassword are required parameters.');

  user.auth.local.salt = undefined;
  user.auth.local.passwordHashMethod = 'bcrypt';
  user.auth.local.hashed_password = await bcryptHash(plainTextPassword); // eslint-disable-line camelcase
}
