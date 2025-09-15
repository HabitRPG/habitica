<template>
  <div>
    <b-modal
      id="close-challenge-modal"
      :title="$t('endChallenge')"
      size="md"
      :hide-header="false"
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
        <close-x
          @close="$root.$emit('bv::hide::modal', 'close-challenge-modal')"
        />
      </div>
      <div class="row text-center">
        <span
          v-if="isFlagged"
          class="col-12"
        >
          <div>{{ $t('cannotClose') }}</div>
        </span>
        <span
          v-else
          class="col-12"
        >
          <div class="col-12">
            <div class="badge-section">
              <div
                class="gems-left"
                v-html="icons.gemsOrange"
              ></div>
              <div
                class="challenge-badge"
                v-html="icons.endChallengeBadge"
              ></div>
              <div
                class="gems-right"
                v-html="icons.gemsPurple"
              ></div>
            </div>
          </div>
          <div class="col-12">
            <strong v-once>{{ $t('selectChallengeWinnersDescription') }}</strong>
          </div>
          <div class="col-12 search-input-container">
            <div class="search-input-wrapper">
              <div
                class="search-icon"
                v-html="icons.search"
              ></div>
              <input
                v-model="searchTerm"
                class="search-input"
                type="text"
                placeholder="@Username"
                @input="searchMembers"
                @focus="showResults = true"
                @blur="handleBlur"
              >
              <div
                v-if="showResults && filteredMembers.length > 0"
                class="search-results"
              >
                <div
                  v-for="member in filteredMembers"
                  :key="member._id"
                  class="search-result-item"
                  @mousedown="selectMember(member)"
                >
                  {{ getMemberDisplayName(member) }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-12">
            <button
              class="btn award-winner-btn"
              :class="{'has-winner': winner._id}"
              :disabled="!winner._id"
              @click="closeChallenge"
            >
              <span>{{ $t('awardWinners') }}</span>
              <div
                class="gem-icon"
                v-html="icons.gem"
              ></div>
              <span>{{ prize }} {{ prize === 1 ? $t('gem') : $t('gems') }}</span>
            </button>
          </div>
        </span>
        <div class="col-12">
          <hr>
          <div class="or">
            {{ $t('or') }}
          </div>
        </div>
        <div class="col-12">
          <strong
            v-once
            class="delete-challenge-text"
          >{{ $t('doYouWantedToDeleteChallenge') }}</strong>
        </div>
        <div
          v-once
          class="col-12 refund-text"
        >
          {{ $t('deleteChallengeRefundDescription') }}
        </div>
        <div class="col-12">
          <button
            v-once
            class="btn btn-danger delete-challenge-btn"
            @click="deleteChallenge()"
          >
            <div
              class="svg-icon color delete-icon"
              v-html="icons.deleteIcon"
            ></div>
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
  @import '@/assets/scss/colors.scss';
  @import '@/assets/scss/button.scss';

  #close-challenge-modal {
    h2 {
      color: $purple-200
    }

    #close-challenge-modal_modal_body {
      padding-bottom: 2em;
    }

    .header-wrap {
      width: 100%;
      padding-top: 32px;
      position: relative;
    }

    .modal-close {
      position: absolute;
      right: 16px;
      top: 16px;
      padding: 0;
      margin: 0;
    }

    .search-input-container {
      margin-top: 1em !important;
    }

    .search-input-wrapper {
      position: relative;
      width: 384px;
      margin: 0 auto;

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-55%);
        width: 16px;
        height: 16px;
        color: $gray-200;
        pointer-events: none;
        display: flex;
        align-items: center;
      }

      .search-input {
        width: 100%;
        height: 32px;
        padding-left: 36px;
        padding-right: 12px;
        border: 1px solid $gray-400;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.2s ease, border-width 0.2s ease;

        &:focus {
          outline: none;
          border: 2px solid $purple-400;
        }

        &::placeholder {
          color: $gray-300;
        }
      }

      .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: $white;
        border: 1px solid $gray-400;
        border-top: none;
        border-radius: 0 0 4px 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .search-result-item {
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;

          &:hover {
            background-color: $purple-600;
            color: $purple-300;
          }
        }
      }
    }

    .delete-challenge-text {
      color: $maroon-50;
    }

    .refund-text {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      line-height: 24px;
      font-weight: 400;
      color: $gray-50;
      margin-top: 0.5em !important;
    }

    .delete-challenge-btn {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 700;
      line-height: 24px;
      display: inline-flex;
      align-items: center;
      gap: 8px;

      .delete-icon {
        width: 16px;
        height: 16px;
        display: inline-flex;
      }
    }

    .award-winner-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 32px;
      padding: 4px 12px;
      transition: all 0.2s ease;

      &:not(:disabled) {
        background-color: $white;
        color: $gray-200;
        border: 1px solid $gray-400;
        box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);

        &.has-winner {
          background-color: $purple-200;
          color: $white;
          border-color: $purple-200;
        }

        &:hover:not(.has-winner) {
          background-color: $gray-700;
        }
      }

      .gem-icon {
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        color: $gems-color;
      }
    }

    .badge-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin: -24px auto 0;
      padding: 0.5rem 0;

      .gems-left, .gems-right {
        width: 64px;
        height: 64px;
        flex-shrink: 0;
      }

      .challenge-badge {
        width: 48px;
        height: 52px;
        flex-shrink: 0;
      }
    }

    .modal-footer, .modal-header {
      border: none !important;
    }

    .modal-header {
      padding: 0 !important;
    }

    .footer-wrap {
      display: none;
    }

    .col-12 {
      margin-top: 1.5em;
    }

    .col-12:first-child {
      margin-top: 0;
    }

    .or {
      margin-top: -2em;
      background: $white;
      width: 40px;
      margin-right: auto;
      margin-left: auto;
      font-weight: bold;
      color: $gray-100;
    }
  }
</style>

<script>
import searchIcon from '@/assets/svg/for-css/search.svg?raw';
import deleteIcon from '@/assets/svg/delete.svg?raw';
import gemIcon from '@/assets/svg/gem.svg?raw';
import endChallengeBadge from '@/assets/svg/for-css/end_challenge_badge.svg?raw';
import gemsOrange from '@/assets/svg/for-css/orange100_red100_yellow100_gems.svg?raw';
import gemsPurple from '@/assets/svg/for-css/purple200_green10_blue100_gems.svg?raw';
import closeX from '@/components/ui/closeX';

export default {
  components: {
    closeX,
  },
  props: ['challengeId', 'members', 'prize', 'flagCount'],
  data () {
    return {
      winner: {},
      searchTerm: '',
      showResults: false,
      filteredMembers: [],
      icons: Object.freeze({
        search: searchIcon,
        deleteIcon,
        gem: gemIcon,
        endChallengeBadge,
        gemsOrange,
        gemsPurple,
      }),
    };
  },
  computed: {
    winnerText () {
      if (!this.winner.profile) return this.$t('selectMember');
      return this.winner.profile.name;
    },
    isFlagged () {
      return this.flagCount > 0;
    },
  },
  methods: {
    searchMembers () {
      if (!this.searchTerm) {
        this.filteredMembers = [];
        return;
      }

      const searchLower = this.searchTerm.toLowerCase().replace('@', '');
      this.filteredMembers = this.members.filter(member => {
        const username = member.auth?.local?.username || '';
        const displayName = member.profile?.name || '';
        return username.toLowerCase().includes(searchLower)
               || displayName.toLowerCase().includes(searchLower);
      }).slice(0, 10);
    },
    getMemberDisplayName (member) {
      if (member.auth?.local?.username) {
        return `@${member.auth.local.username}`;
      }
      return member.profile?.name || '';
    },
    selectMember (member) {
      this.winner = member;
      this.searchTerm = this.getMemberDisplayName(member);
      this.showResults = false;
    },
    handleBlur () {
      setTimeout(() => {
        this.showResults = false;
      }, 200);
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
