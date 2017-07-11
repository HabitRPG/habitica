import intersection from 'lodash/intersection';

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
    isLeaderOfGroup (user, group) {
      return user._id === group.leader._id;
    },
    filterGuild (group, filters, search, user) {
      let passedSearch = true;
      let hasCategories = true;
      let isMember = true;
      let isLeader = true;

      if (search) {
        passedSearch = group.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
      }

      if (filters.categories && filters.categories.length > 0) {
        let intersectingCats = intersection(filters.categories, group.categories);
        hasCategories = intersectingCats.length > 0;
      }

      let filteringRole = filters.roles && filters.roles.length > 0;
      if (filteringRole && filters.roles.indexOf('member')) {
        isMember = this.isMemberOfGroup(user, group);
      }

      if (filteringRole && filters.roles.indexOf('guild_leader')) {
        isLeader = this.isLeaderOfGroup(user, group);
      }

      // @TODO: Tier filters

      return passedSearch && hasCategories && isMember && isLeader;
    },
  },
};
