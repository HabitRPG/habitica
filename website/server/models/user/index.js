import mongoose from 'mongoose';

import schema from './schema'; // eslint-disable-line import/no-cycle

import './hooks'; // eslint-disable-line import/no-cycle
import './methods'; // eslint-disable-line import/no-cycle

// A list of publicly accessible fields (not everything from preferences
// because there are also a lot of settings tha should remain private)
export const publicFields = `preferences.size preferences.hair preferences.skin preferences.shirt
  preferences.chair preferences.costume preferences.sleep preferences.background preferences.tasks preferences.disableClasses profile stats
  achievements party backer contributor auth.timestamps items inbox.optOut loginIncentives flags.classSelected
  flags.verifiedUsername auth.local.username`;

// The minimum amount of data needed when populating multiple users
export const nameFields = 'profile.name auth.local.username flags.verifiedUsername';

export { schema };

export const model = mongoose.model('User', schema);
