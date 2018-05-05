import intersection from 'lodash/intersection';

export default {
  methods: {
    isMemberOfChallenge (user, challenge) {
      return user.challenges.indexOf(challenge._id) !== -1;
    },
    isLeaderOfChallenge (user, challenge) {
      return challenge.leader && user._id === challenge.leader._id;
    },
    filterChallenge (challenge, filters, search, user) {
      let passedSearch = true;
      let hasCategories = true;
      let isMember = true;
      let isLeader = true;
      let ownerShip = true;

      if (search) {
        passedSearch = challenge.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
      }

      if (filters.categories && filters.categories.length > 0) {
        let challengeCategories = challenge.categories.map(chal => chal.slug);
        let intersectingCats = intersection(filters.categories, challengeCategories);
        hasCategories = intersectingCats.length > 0;
      }

      let filteringRole = filters.roles && filters.roles.length > 0;
      if (filteringRole && filters.roles.indexOf('participating') !== -1) {
        isMember = this.isMemberOfChallenge(user, challenge);
      }

      if (filteringRole && filters.roles.indexOf('not_participating') !== -1) {
        isMember = !this.isMemberOfChallenge(user, challenge);
      }

      if (filters.ownership && filters.ownership.indexOf('not_owned') !== -1) {
        ownerShip = !this.isLeaderOfChallenge(user, challenge);
      }

      if (filters.ownership && filters.ownership.indexOf('owned') !== -1) {
        ownerShip = this.isLeaderOfChallenge(user, challenge);
      }

      return passedSearch && hasCategories && isMember && isLeader && ownerShip;
    },
  },
};
