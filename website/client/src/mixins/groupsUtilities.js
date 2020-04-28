import intersection from 'lodash/intersection';
import _ from 'lodash';

const containsAnyCi = (target, patterns) => patterns.some(el => target.match(new RegExp(el, 'i')));
const isPassedSearch = ({ name, summary, description }, search) => {
  if (!search) return false;

  const searchWords = _.escapeRegExp(search.trim()).split(/\s+/);

  if (containsAnyCi(name, searchWords)) return true;

  if (!summary) return false;
  if (containsAnyCi(summary, searchWords)) return true;

  if (!description) return false;
  if (containsAnyCi(description, searchWords)) return true;

  return false;
};

export default {
  filters: {
    // https://stackoverflow.com/questions/2685911/is-there-a-way-to-round-numbers-into-a-reader-friendly-format-e-g-1-1k
    abbrNum: number => {
      let decPlaces = 1;
      decPlaces = 10 ** decPlaces;

      const abbrev = ['k', 'm', 'b', 't'];
      for (let i = abbrev.length - 1; i >= 0; i -= 1) {
        const size = 10 ** ((i + 1) * 3);

        if (size <= number) {
          number = Math.floor((number * decPlaces) / size) / decPlaces; // eslint-disable-line no-param-reassign, max-len

          if (number === 1000 && i < abbrev.length - 1) {
            number = 1; // eslint-disable-line no-param-reassign
            i += 1;
          }

          number += abbrev[i]; // eslint-disable-line no-param-reassign
          break;
        }
      }

      return number;
    },
  },
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
      return user._id === group.leader || user._id === group.leader._id;
    },
    filterGuild (group, filters, search, user) {
      let passedSearch = true;
      let hasCategories = true;
      let isMember = true;
      let isLeader = true;
      let correctSize = true;

      if (group._id === this.$store.state.constants.TAVERN_ID || group._id === 'habitrpg') return false;

      if (search) passedSearch = isPassedSearch(group, search);

      if (filters.categories && filters.categories.length > 0) {
        const intersectingCats = intersection(filters.categories, group.categorySlugs);
        hasCategories = intersectingCats.length > 0;
      }

      const filteringRole = filters.roles && filters.roles.length > 0;
      if (filteringRole && filters.roles.indexOf('member') !== -1) {
        isMember = this.isMemberOfGroup(user, group);
      }

      if (filteringRole && filters.roles.indexOf('guild_leader') !== -1) {
        isLeader = this.isLeaderOfGroup(user, group);
      }

      if (filters.guildSize && filters.guildSize.indexOf('gold_tier') !== -1) {
        correctSize = group.memberCount >= 1000;
      }

      if (filters.guildSize && filters.guildSize.indexOf('silver_tier') !== -1) {
        correctSize = group.memberCount >= 100 && group.memberCount < 1000;
      }

      if (filters.guildSize && filters.guildSize.indexOf('bronze_tier') !== -1) {
        correctSize = group.memberCount < 100;
      }

      return passedSearch && hasCategories && isMember && isLeader && correctSize;
    },
  },
};
