import mongoose from 'mongoose';

import schema from './schema';

require('./hooks');
require('./methods');

// A list of publicly accessible fields (not everything from preferences because there are also a lot of settings tha should remain private)
export let publicFields = `preferences.size preferences.hair preferences.skin preferences.shirt
  preferences.chair preferences.costume preferences.sleep preferences.background profile stats
  achievements party backer contributor auth.timestamps items inbox.optOut`;

// The minimum amount of data needed when populating multiple users
export let nameFields = 'profile.name';

export { schema };

export let model = mongoose.model('User', schema);

// Initially export an empty object so external requires will get
// the right object by reference when it's defined later
// Otherwise it would remain undefined if requested before the query executes
export let mods = [];

mongoose.model('User')
  .find({'contributor.admin': true})
  .sort('-contributor.level -backer.npc profile.name')
  .select('profile contributor backer')
  .exec()
  .then((foundMods) => {
    // Using push to maintain the reference to mods
    mods.push(...foundMods);
  });
