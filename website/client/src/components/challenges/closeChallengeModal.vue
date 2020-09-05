<template>
  <div>
    <b-modal
      id="close-challenge-modal"
      :title="$t('createGuild')"
      size="md"
    >
      <div
        slot="modal-header"
        class="header-wrap"
      >
        <h2
          v-once
          class="text-center"
        >
          {{ $t('endChallenge') }}
        </h2>
      </div>
      <div class="row text-center">
        <div class="col-12">
          <div class="support-habitica">
            <!-- @TODO: Add challenge achievement badge here-->
          </div>
        </div>
        <div class="col-12">
          <strong v-once>{{ $t('selectChallengeWinnersDescription') }}</strong>
        </div>
        <div class="col-12">
          <member-search-dropdown
            :text="winnerText"
            :members="members"
            :challenge-id="challengeId"
            @member-selected="selectMember"
          />
        </div>
        <div class="col-12">
          <button
            v-once
            class="btn btn-primary"
            @click="closeChallenge"
          >
            {{ $t('awardWinners') }}
          </button>
        </div>
        <div class="col-12">
          <hr>
          <div class="or">
            {{ $t('or') }}
          </div>
        </div>
        <div class="col-12">
          <strong v-once>{{ $t('doYouWantedToDeleteChallenge') }}</strong>
        </div>
        <div class="col-12">
          <button
            v-once
            class="btn btn-danger"
            @click="deleteChallenge()"
          >
            {{ $t('deleteChallenge') }}
          </button>
        </div>
      </div>
      <div
        slot="modal-footer"
        class="footer-wrap"
      ></div>
    </b-modal>
  </div>
</template>

<style lang='scss'>
  @import '~@/assets/scss/colors.scss';

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
      background-image: url('~@/assets/svg/for-css/support-habitica-gems.svg');
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
import memberSearchDropdown from '@/components/members/memberSearchDropdown';

export default {
  components: {
    memberSearchDropdown,
  },
  props: ['challengeId', 'members', 'prize'],
  data () {
    return {
      winner: {},
    };
  },
  computed: {
    winnerText () {
      if (!this.winner.profile) return this.$t('selectMember');
      return this.winner.profile.name;
    },
  },
  methods: {
    selectMember (member) {
      this.winner = member;
    },
    async closeChallenge () {
      this.challenge = await this.$store.dispatch('challenges:selectChallengeWinner', {
        challengeId: this.challengeId,
        winnerId: this.winner._id,
      });
      this.$root.$emit('bv::hide::modal', 'close-challenge-modal');
      this.$router.push('/challenges/myChallenges');
    },
    async deleteChallenge () {
      if (!window.confirm(this.$t('sureDelCha'))) return; // eslint-disable-line no-alert
      this.challenge = await this.$store.dispatch('challenges:deleteChallenge', {
        challengeId: this.challengeId,
        prize: this.prize,
      });
      this.$root.$emit('bv::hide::modal', 'close-challenge-modal');
      this.$router.push('/challenges/myChallenges');
    },
  },
};
</script>
