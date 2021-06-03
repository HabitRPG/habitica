export default {
  methods: {
    isMemberOfChallenge (user, challenge) {
      return user.challenges.indexOf(challenge._id) !== -1;
    },
  },
  computed: {
    filteredChallenges () {
      const { filters } = this;
      const { user } = this;

      return this.challenges.filter(challenge => {
        const filteringMembership = filters.membership && filters.membership.length > 0;

        // if both filters are selected, display all challenges
        if (filteringMembership && filters.membership.indexOf('participating') !== -1
        && filteringMembership && filters.membership.indexOf('not_participating') !== -1) {
          return true;
        }

        if (filteringMembership && filters.membership.indexOf('participating') !== -1) {
          return this.isMemberOfChallenge(user, challenge);
        }
        if (filteringMembership && filters.membership.indexOf('not_participating') !== -1) {
          return !this.isMemberOfChallenge(user, challenge);
        }
        return true;
      });
    },
  },
};
