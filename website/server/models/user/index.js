import mongoose from 'mongoose';

import logger from '../../libs/logger';
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

// Initially export an empty object so external requires will get
// the right object by reference when it's defined later
// Otherwise it would remain undefined if requested before the query executes
export const mods = [];

mongoose.model('User')
  .find({ 'contributor.moderator': true })
  .sort('-contributor.level -backer.npc profile.name')
  .select('profile contributor backer')
  .exec()
  .then(foundMods => {
    // Using push to maintain the reference to mods
    mods.push(...foundMods);
  })
  .catch(err => logger.error(err));
