/**
 * Converts from timezoneOffset (which corresponded to the value returned
 * from moment.js's deprecated `moment#zone` method) to timezoneUtcOffset.
 *
 * This is done with conversion instead of changing it in the database to
 * be backwards compatible with the database values and old clients.
 *
 * Not as a user method since it needs to work in the frontend as well.
 */
export default function getUtcOffset (user) {
  return -(user.preferences.timezoneOffset || 0);
}
