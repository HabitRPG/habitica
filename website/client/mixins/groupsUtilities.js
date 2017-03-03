// TODO if we only have a single method here, move it to an utility
// a full mixin is not needed

import { TAVERN_ID } from '../../common/script/constants';

export default {
  methods: {
    isMemberOfGroup (user, group) {
      if (group._id === TAVERN_ID) return true;

      // If the group is a guild, just check for an intersection with the
      // current user's guilds, rather than checking the members of the group.
      if (group.type === 'guild') {
        return user.guilds.find(guildId => guildId === group._id);
      }

      // Similarly, if we're dealing with the user's current party, return true.
      if (group.type === 'party') {
        return user.party._id === group._id;
      }

      return false;
    },
  },
};