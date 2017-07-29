<template lang="pug">
.row
  challenge-modal
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .col-10.standard-page
    .row.header-row
      .col-md-8.text-left
        h1(v-once) {{$t('findChallenges')}}
      .col-md-4
        span.dropdown-label {{ $t('sortBy') }}
        b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(v-for='sortOption in sortOptions', :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}
        button.btn.btn-secondary.create-challenge-button
          .svg-icon.positive-icon(v-html="icons.positiveIcon")
          span(v-once, @click='createChallenge()') {{$t('createChallenge')}}
    .row
      .col-6(v-for='challenge in challenges')
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
</style>

<script>
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import Sidebar from './sidebar';
import ChallengeItem from './challengeItem';
import challengeModal from './challengeModal';

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
        positiveIcon,
      }),
      challenges: [],
      sortOptions: [],
    };
  },
  mounted () {
    this.loadchallanges();

    // @TODO: do we need to load groups for filters still?
  },
  methods: {
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
