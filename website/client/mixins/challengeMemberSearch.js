// @TODO: How do we require data or make this functional
import debounce from 'lodash/debounce';

export default {
  watch: {
    searchTerm: debounce(function searchTerm (newSearch) {
      this.challengeMemberSearchMixin_searchChallengeMember(newSearch);
    }, 500),
    members () {
      this.memberResults = this.members;
    },
  },
  methods: {
    async challengeMemberSearchMixin_searchChallengeMember (search) { // eslint-disable-line
      this.memberResults = await this.$store.dispatch('members:getChallengeMembers', {
        challengeId: this.challengeId,
        searchTerm: search,
      });
    },
  },
};
