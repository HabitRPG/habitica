export default {
  methods: {
    isMemberOfGroup (user, group) {
      if (group._id === this.$store.state.constants.TAVERN_ID) return true;

      // If the group is a guild, just check for an intersection with the
      // current user's guilds, rather than checking the members of the group.
      if (group.type === 'guild') {
        return user.guilds.indexOf(group._id) !== -1;
      }

      // Similarly, if we're dealing with the user's current party, return true.
      if (group.type === 'party') {
        return user.party._id === group._id;
      }

      return false;
    },
  },
};