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
      .no-challenges.text-center.col-md-6.offset-3(v-if='filteredChallenges.length === 0')
        .svg-icon(v-html="icons.challengeIcon")
        h2(v-once) {{$t('noChallengeTitle')}}
        p(v-once) {{$t('challengeDescription1')}}
        p(v-once) {{$t('challengeDescription2')}}

    .row
      .col-12.col-md-6(v-for='challenge in filteredChallenges')
        challenge-item(:challenge='challenge')
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
    color: $gray-300;
    margin-top: 10em;

    h2 {
      color: $gray-300;
    }

    .svg-icon {
      width: 88.7px;
      margin: 1em auto;
    }
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

export default {
  mixins: [challengeUtilities],
  components: {
    Sidebar,
    ChallengeItem,
    challengeModal,
  },
  data () {
    return {
      icons: Object.freeze({
        challengeIcon,
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
      filters: {
        roles: ['participating'], // This is required for my challenges
      },
    };
  },
  mounted () {
    this.loadchallanges();
  },
  computed: {
    ...mapState({user: 'user.data'}),
    filteredChallenges () {
      let search = this.search;
      let filters = this.filters;
      let user = this.$store.state.user.data;

      // Always filter by member on this page:
      filters.roles = ['participating'];

      // @TODO: Move this to the server
      return this.challenges.filter((challenge) => {
        return this.filterChallenge(challenge, filters, search, user);
      });
    },
  },
  methods: {
    memberOf (challenge) {
      return this.user.challenges.indexOf(challenge._id) !== -1;
    },
    updateSearch (eventData) {
      this.search = eventData.searchTerm;
    },
    updateFilters (eventData) {
      this.filters = eventData;
    },
    createChallenge () {
      this.$store.state.challengeOptions.workingChallenge = {};
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    },
    async loadchallanges () {
      this.challenges = await this.$store.dispatch('challenges:getUserChallenges', {
        member: true,
      });
    },
    challengeCreated (challenge) {
      this.challenges.push(challenge);
    },
  },
};
</script>
