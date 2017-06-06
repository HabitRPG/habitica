// Utilities for working with passwords
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { decrypt } from './encryption';
import moment from 'moment';
import { model as User } from '../models/user';

const BCRYPT_SALT_ROUNDS = 10;

// Hash a plain text password
export function bcryptHash (passwordToHash) {
  return bcrypt.hash(passwordToHash, BCRYPT_SALT_ROUNDS); // returns a promise
}

// Check if a plain text password matches a hash
export function bcryptCompare (passwordToCheck, hashedPassword) {
  return bcrypt.compare(passwordToCheck, hashedPassword); // returns a promise
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

  let passwordHashMethod = user.auth.local.passwordHashMethod;
  let passwordHash = user.auth.local.hashed_password;
  let passwordSalt = user.auth.local.salt; // Only used for SHA1

  if (passwordHashMethod === 'bcrypt') {
    return await bcryptCompare(passwordToCheck, passwordHash);
  // default to sha1 if the user has a salt but no passwordHashMethod
  } else if (passwordHashMethod === 'sha1' || !passwordHashMethod && passwordSalt) {
    return passwordHash === sha1Encrypt(passwordToCheck, passwordSalt);
  } else {
    throw new Error('Invalid password hash method.');
  }
}

// Convert an user to use bcrypt from sha1 for password hashing
// needs to save the user separately.
// NOTE: before calling this method it should be verified that the supplied plain text password
// is indeed hashed with sha1 and is valid
export async function convertToBcrypt (user, plainTextPassword) {
  if (!user || !plainTextPassword) throw new Error('user and plainTextPassword are required parameters.');

  user.auth.local.salt = undefined;
  user.auth.local.passwordHashMethod = 'bcrypt';
  user.auth.local.hashed_password = await bcryptHash(plainTextPassword); // eslint-disable-line camelcase
}

// Returns the user if a valid password reset code is supplied, otherwise false
export async function validatePasswordResetCodeAndFindUser (code) {
  let isCodeValid = true;

  let userId;
  let user;
  let decryptedPasswordResetCode;

  // wrapping the code in a try to be able to handle the error here
  try {
    decryptedPasswordResetCode = JSON.parse(decrypt(code || 'invalid')); // also catches missing code
    userId = decryptedPasswordResetCode.userId;
    let expiresAt = decryptedPasswordResetCode.expiresAt;

    if (moment(expiresAt).isBefore(moment())) throw new Error();
  } catch (err) {
    isCodeValid = false;
  }

  if (isCodeValid) {
    user = await User.findById(userId).exec();

    // check if user is found and if it's an email & password account
    if (!user || !user.auth || !user.auth.local || !user.auth.local.email) {
      isCodeValid = false;
    } else if (code !== user.auth.local.passwordResetCode) {
      // Make sure only the last code can be used
      isCodeValid = false;
    }
  }

  return isCodeValid ? user : false;
}
