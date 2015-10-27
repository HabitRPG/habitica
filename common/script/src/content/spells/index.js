import {each} from 'lodash';

import wizard from './wizard';
import warrior from './warrior';
import healer from './healer';
import rogue from './rogue';
import special from './special';

/*
  ---------------------------------------------------------------
  Spells
  ---------------------------------------------------------------
  Text, notes, and mana are obvious. The rest:

  * {target}: one of [task, self, party, user]. This is very important, because if the cast() function is expecting one
    thing and receives another, it will cause errors. `self` is used for self buffs, multi-task debuffs, AOEs (eg, meteor-shower),
    etc. Basically, use self for anything that's not [task, party, user] and is an instant-cast

  * {cast}: the function that's run to perform the ability's action. This is pretty slick - because this is exported to the
    web, this function can be performed on the client and on the server. `user` param is self (needed for determining your
    own stats for effectiveness of cast), and `target` param is one of [task, party, user]. In the case of `self` spells,
    you act on `user` instead of `target`. You can trust these are the correct objects, as long as the `target` attr of the
    spell is correct. Take a look at habitrpg/src/models/user.js and habitrpg/src/models/task.js for what attributes are
    available on each model. Note `task.value` is its "redness". If party is passed in, it's an array of users,
    so you'll want to iterate over them like: `_.each(target,function(member){...})`

  Note, user.stats.mp is docked after automatically (it's appended to functions automatically down below in an _.each)
 */

var spells = {
  wizard: wizard,
  warrior: warrior,
  rogue: rogue,
  healer: healer,
  special: special,
};

// Intercept all spells to reduce user.stats.mp after casting the spell
each(spells, (spellClass) => {
  each(spellClass, (spell, key) => {
    spell.key = key;

    let _cast = spell.cast;
    spell.cast = (user, target) => {
      _cast(user, target);
      return user.stats.mp -= spell.mana;
    };
  });
});

export default spells;
