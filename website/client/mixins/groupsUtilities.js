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
      let correctSize = true;

      if (group._id === this.$store.state.constants.TAVERN_ID || group._id === 'habitrpg') return false;

      if (search) {
        passedSearch = group.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
      }

      if (filters.categories && filters.categories.length > 0) {
        let intersectingCats = intersection(filters.categories, group.categories);
        hasCategories = intersectingCats.length > 0;
      }

      let filteringRole = filters.roles && filters.roles.length > 0;
      if (filteringRole && filters.roles.indexOf('member') !== -1) {
        isMember = this.isMemberOfGroup(user, group);
      }

      if (filteringRole && filters.roles.indexOf('guild_leader') !== -1) {
        isLeader = this.isLeaderOfGroup(user, group);
      }

      if (filters.guildSize && filters.guildSize.indexOf('gold_tier') !== -1) {
        correctSize = group.memberCount > 1000;
      }

      if (filters.guildSize && filters.guildSize.indexOf('silver_tier') !== -1) {
        correctSize = group.memberCount > 100 && group.memberCount < 999;
      }

      if (filters.guildSize && filters.guildSize.indexOf('bronze_tier') !== -1) {
        correctSize = group.memberCount < 99;
      }

      return passedSearch && hasCategories && isMember && isLeader && correctSize;
    },
  },
};
