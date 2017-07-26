<template lang="pug">
.row
  challenge-modal
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .col-10.standard-page
    .row.header-row
      .col-md-8.text-left
        h1(v-once) {{$t('myChallenges')}}
      .col-md-4
        span.dropdown-label {{ $t('sortBy') }}
        b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(v-for='sortOption in sortOptions', :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}
        button.btn.btn-secondary.create-challenge-button
          .svg-icon.positive-icon(v-html="icons.positiveIcon")
          span(v-once, @click='createChallenge()') {{$t('createChallenge')}}

    .row
      .no-challenges.text-center.col-md-6.offset-3(v-if='challenges.length === 0')
        .svg-icon(v-html="icons.challengeIcon")
        h2(v-once) {{$t('noChallengeTitle')}}
        p(v-once) {{$t('challengeDescription1')}}
        p(v-once) {{$t('challengeDescription2')}}

    .row
      .col-6(v-for='challenge in challenges', v-if='memberOf(challenge)')
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

import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import Sidebar from './sidebar';
import ChallengeItem from './challengeItem';
import challengeModal from './challengeModal';

import challengeIcon from 'assets/svg/challenge.svg';
import positiveIcon from 'assets/svg/positive.svg';

export default {
  components: {
    Sidebar,
    ChallengeItem,
    challengeModal,
    bDropdown,
    bDropdownItem,
  },
  data () {
    return {
      icons: Object.freeze({
        challengeIcon,
        positiveIcon,
      }),
      challenges: [
      ],
      sortOptions: [],
    };
  },
  mounted () {
    this.loadchallanges();
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    memberOf (challenge) {
      return this.user.challenges.indexOf(challenge._id) !== -1;
    },
    updateSearch () {

    },
    updateFilters () {

    },
    createChallenge () {
      this.$root.$emit('show::modal', 'challenge-modal');
    },
    async loadchallanges () {
      this.challenges = await this.$store.dispatch('challenges:getUserChallenges');
    },
  },
};
</script>
