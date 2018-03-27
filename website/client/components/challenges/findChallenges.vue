<template lang="pug">
.row
  challenge-modal(v-on:createChallenge='challengeCreated')
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")
  .col-12.col-md-10.standard-page
    .row.header-row
      .col-md-8.text-left
        h1(v-once) {{$t('findChallenges')}}
        h2(v-if='loading') {{ $t('loading') }}
      .col-md-4
        // @TODO: implement sorting span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}
        button.btn.btn-secondary.create-challenge-button.float-right(@click='createChallenge()')
          .svg-icon.positive-icon(v-html="icons.positiveIcon")
          span(v-once) {{$t('createChallenge')}}
    .row
      .col-12.col-md-6(v-for='challenge in filteredChallenges', v-if='!memberOf(challenge)')
        challenge-item(:challenge='challenge')
    .row
      .col-12.text-center
        button.btn.btn-secondary(@click='loadMore()') {{ $t('loadMore') }}
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
</style>

<script>
import { mapState } from 'client/libs/store';

import Sidebar from './sidebar';
import ChallengeItem from './challengeItem';
import challengeModal from './challengeModal';
import challengeUtilities from 'client/mixins/challengeUtilities';

import positiveIcon from 'assets/svg/positive.svg';

export default {
  mixins: [challengeUtilities],
  components: {
    Sidebar,
    ChallengeItem,
    challengeModal,
  },
  data () {
    return {
      loading: true,
      icons: Object.freeze({
        positiveIcon,
      }),
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
    this.loadchallanges();
  },
  computed: {
    ...mapState({user: 'user.data'}),
    filteredChallenges () {
      return this.challenges;
    },
  },
  methods: {
    memberOf (challenge) {
      return this.user.challenges.indexOf(challenge._id) !== -1;
    },
    updateSearch (eventData) {
      this.search = eventData.searchTerm;
      this.page = 0;
      this.loadchallanges();
    },
    updateFilters (eventData) {
      this.filters = eventData;
      this.page = 0;
      this.loadchallanges();
    },
    createChallenge () {
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    },
    async loadchallanges () {
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
      });

      if (this.page === 0) {
        this.challenges = challenges;
      } else {
        this.challenges = this.challenges.concat(challenges);
      }

      this.loading = false;
    },
    challengeCreated (challenge) {
      this.challenges.push(challenge);
    },
    async loadMore () {
      this.page += 1;
      this.loadchallanges();
    },
  },
};
</script>
