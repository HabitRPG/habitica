<template lang="pug">
.row
  challenge-modal(v-on:createChallenge='challengeCreated')
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .col-10.standard-page
    .row.header-row
      .col-md-8.text-left
        h1(v-once) {{$t('myChallenges')}}
      .col-md-4
        // @TODO: implement sorting span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}
        button.btn.btn-secondary.create-challenge-button.float-right(@click='createChallenge()')
          .svg-icon.positive-icon(v-html="icons.positiveIcon")
          span(v-once) {{$t('createChallenge')}}

    .row
      .no-challenges.text-center.col-md-6.offset-3(v-if='!loading && challenges.length === 0')
        .svg-icon(v-html="icons.challengeIcon")
        h2(v-once) {{$t('noChallengeTitle')}}
        p(v-once) {{$t('challengeDescription1')}}
        p(v-once) {{$t('challengeDescription2')}}

    .row
      .no-challenges.text-center.col-md-6.offset-3(v-if='!loading && challenges.length > 0 && filteredChallenges.length === 0')
        h2(v-once) {{$t('noChallengeMatchFilters')}}

    .row
      .col-12.col-md-6(v-for='challenge in filteredChallenges')
        challenge-item(:challenge='challenge')
      mugen-scroll(
        :handler="infiniteScrollTrigger",
        :should-handle="!loading && canLoadMore",
        :threshold="1",
        v-show="loading",
      )
        h2.col-12.loading(v-once) {{ $t('loading') }}
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

  .header-row {
    h1 {
      color: $purple-200;
    }

    .create-challenge-button {
      margin-left: 1em;
    }

    .positive-icon {
      color: $green-10;
      width: 10px;
      display: inline-block;
      margin-right: .5em;
    }
  }

  .no-challenges {
    color: $gray-200;
    margin-top: 10em;

    h2 {
      color: $gray-200;
    }

    .svg-icon {
      color: #C3C0C7;
      width: 88.7px;
      margin: 1em auto;
    }
  }

  .loading {
    text-align: center;
    color: $purple-300;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import Sidebar from './sidebar';
import ChallengeItem from './challengeItem';
import challengeModal from './challengeModal';
import challengeUtilities from 'client/mixins/challengeUtilities';

import challengeIcon from 'assets/svg/challenge.svg';
import positiveIcon from 'assets/svg/positive.svg';
import MugenScroll from 'vue-mugen-scroll';

import debounce from 'lodash/debounce';

export default {
  mixins: [challengeUtilities],
  components: {
    Sidebar,
    ChallengeItem,
    challengeModal,
    MugenScroll,
  },
  data () {
    return {
      icons: Object.freeze({
        challengeIcon,
        positiveIcon,
      }),
      loading: false,
      canLoadMore: true,
      challenges: [],
      sort: 'none',
      sortOptions: [
        {
          text: this.$t('none'),
          value: 'none',
        },
        {
          text: this.$t('participants'),
          value: 'participants',
        },
        {
          text: this.$t('name'),
          value: 'name',
        },
        {
          text: this.$t('end_date'),
          value: 'end_date',
        },
        {
          text: this.$t('start_date'),
          value: 'start_date',
        },
      ],
      search: '',
      filters: {},
      page: 0,
    };
  },
  mounted () {
    this.loadChallenges();
  },
  computed: {
    ...mapState({user: 'user.data'}),
    filteredChallenges () {
      const filters = this.filters;
      const user = this.user;

      return this.challenges.filter(challenge => {
        let isMember = true;

        let filteringRole = filters.roles && filters.roles.length > 0;
        if (filteringRole && filters.roles.indexOf('participating') !== -1) {
          isMember = this.isMemberOfChallenge(user, challenge);
        }

        if (filteringRole && filters.roles.indexOf('not_participating') !== -1) {
          isMember = !this.isMemberOfChallenge(user, challenge);
        }

        return isMember;
      });
    },
  },
  methods: {
    updateSearch (eventData) {
      this.search = eventData.searchTerm;
      this.page = 0;
      this.loadChallenges();
    },
    updateFilters (eventData) {
      this.filters = eventData;
      this.page = 0;
      this.loadChallenges();
    },
    createChallenge () {
      this.$store.state.challengeOptions.workingChallenge = {};
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    },
    async loadChallenges () {
      this.loading = true;

      let categories = '';
      if (this.filters.categories) {
        categories = this.filters.categories.join(',');
      }

      let owned = '';
      // @TODO: we skip ownership === 2 because it is the same as === 0 right now
      if (this.filters.ownership && this.filters.ownership.length === 1) {
        owned = this.filters.ownership[0];
      }

      const challenges = await this.$store.dispatch('challenges:getUserChallenges', {
        page: this.page,
        search: this.search,
        categories,
        owned,
        member: true,
      });

      if (this.page === 0) {
        this.challenges = challenges;
      } else {
        this.challenges = this.challenges.concat(challenges);
      }

      // only show the load more Button if the max count was returned
      this.canLoadMore = challenges.length === 10;

      this.loading = false;
    },
    challengeCreated (challenge) {
      this.challenges.push(challenge);
    },
    infiniteScrollTrigger () {
      // show loading and wait until the loadMore debounced
      // or else it would trigger on every scrolling-pixel (while not loading)
      if (this.canLoadMore) {
        this.loading = true;
      }

      this.loadMore();
    },
    loadMore: debounce(function loadMoreDebounce () {
      this.page += 1;
      this.loadChallenges();
    }, 1000),
  },
};
</script>
