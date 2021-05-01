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
        let isMember = true;

        const filteringRole = filters.membership && filters.membership.length > 0;
        if (filteringRole && filters.membership.indexOf('participating') !== -1) {
          isMember = this.isMemberOfChallenge(user, challenge);
        }

        if (filteringRole && filters.membership.indexOf('not_participating') !== -1) {
          isMember = !this.isMemberOfChallenge(user, challenge);
        }

        return isMember;
      });
    },
  },
};
