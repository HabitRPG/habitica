import crypto from 'crypto';

// Generate a random email verification token

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Get expiry date for token

export function tokenExpiryHours(hours = 48) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d;
}
