import crypto from 'crypto';

export function encrypt (password, salt) {
  return crypto
          .createHmac('sha1', salt)
          .update(password)
          .digest('hex');
}

export function makeSalt (len = 10) {
  return crypto
          .randomBytes(Math.ceil(len / 2))
          .toString('hex')
          .substring(0, len);
}