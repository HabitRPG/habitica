import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'crypto';
import nconf from 'nconf';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // 96-bit nonce per NIST guidance for GCM
const AUTH_TAG_LENGTH_BYTES = 16; // 128-bit authentication tag
const SESSION_SECRET_KEY = nconf.get('SESSION_SECRET_KEY');

const key = Buffer.from(SESSION_SECRET_KEY, 'hex');

/**
 * Encrypt a UTF-8 string using AES-256-GCM and return iv|ciphertext|tag as hex.
 * A fresh nonce is generated for every message to avoid keystream reuse, and
 * the auth tag ensures forged payloads are rejected at the trust boundary.
 */
export function encrypt (text) {
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, authTag]).toString('hex');
}

/**
 * Decrypt an AES-256-GCM payload previously produced by encrypt().
 * The layout is iv (12B) || ciphertext || authTag (16B), all hex encoded.
 */
export function decrypt (text) {
  const payload = Buffer.from(text, 'hex');
  if (payload.length <= IV_LENGTH_BYTES + AUTH_TAG_LENGTH_BYTES) {
    throw new Error('Encrypted payload is malformed');
  }

  const iv = payload.subarray(0, IV_LENGTH_BYTES);
  const authTag = payload.subarray(payload.length - AUTH_TAG_LENGTH_BYTES);
  const ciphertext = payload.subarray(IV_LENGTH_BYTES, payload.length - AUTH_TAG_LENGTH_BYTES);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}
