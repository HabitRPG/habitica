<template lang="pug">
div
  b-modal#close-challenge-modal(:title="$t('createGuild')", size='md')
    .header-wrap(slot="modal-header")
      h2.text-center(v-once) {{$t('endChallenge')}}
    .row.text-center
      .col-12
        .support-habitica
          // @TODO: Add challenge achievement badge here
      .col-12
        strong(v-once) {{$t('selectChallengeWinnersDescription')}}
      .col-12
        b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(@click='sort(option.value)')
            | Member
      .col-12
        button.btn.btn-primary(v-once) {{$t('awardWinners')}}
      .col-12
        hr
        .or {{$t('or')}}
      .col-12
        strong(v-once) {{$t('doYouWantedToDeleteChallenge')}}
      .col-12
        button.btn.btn-danger(v-once) {{$t('deleteChallenge')}}
    .footer-wrap(slot="modal-footer")
</template>

<style lang='scss'>
  @import '~client/assets/scss/colors.scss';

  #close-challenge-modal {
    h2 {
      color: $purple-200
    }

    #close-challenge-modal_modal_body {
      padding-bottom: 2em;
    }

    .header-wrap {
      width: 100%;
      padding-top: 2em;
    }

    .support-habitica {
      background-image: url('~client/assets/svg/for-css/support-habitica-gems.svg');
      width: 325px;
      height: 89px;
      margin: 0 auto;
    }

    .modal-footer, .modal-header {
      border: none !important;
    }

    .footer-wrap {
      display: none;
    }

    .col-12 {
      margin-top: 2em;
    }

    .or {
      margin-top: -2em;
      background: $white;
      width: 40px;
      margin-right: auto;
      margin-left: auto;
      font-weight: bold;
    }
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

export default {
  props: ['challenge'],
  components: {
    bModal,
    bDropdown,
    bDropdownItem,
  },

  data () {
    return {
    };
  },
  methods: {
    closeChallenge () {
      // this.challenge = this.$store.dispatch('challenges:selectChallengeWinner', {
      //   challengeId: this.challengeId,
      //   winnerId: this.winnerId,
      // });
    },
    deleteChallenge () {
      // this.challenge = this.$store.dispatch('challenges:deleteChallenge', {challengeId: this.challengeId});
    },
  },
};
</script>
