<template>
  <b-modal
    id="group-plan-selection"
    :hide-footer="true"
    :hide-header="true"
    size="md"
    @show="loadData"
    @hide="onHide"
  >
    <div class="selection-modal">
      <div class="modal-header-row">
        <h2 class="title">
          {{ $t('chooseAnOption') }}
        </h2>
        <div class="header-actions">
          <span
            class="cancel-text"
            @click="close"
          >
            {{ $t('cancel') }}
          </span>
          <button
            class="btn btn-primary next-button"
            :class="{ disabled: !selectedOption }"
            :disabled="!selectedOption"
            @click="continueFlow"
          >
            {{ $t('next') }}
          </button>
        </div>
      </div>

      <div
        v-if="loading"
        class="loading-container"
      >
        <div class="spinner-border text-secondary"></div>
      </div>

      <template v-else>
        <div
          v-if="hasUpgradeableGroups"
          class="section-header"
        >
          {{ $t('upgradeExistingGroup') }}
        </div>

        <selectable-card
          v-for="group in upgradeableGuilds"
          :key="group._id"
          class="option-card"
          :selected="isSelected(group)"
          @click="selectOption(group)"
        >
          <div class="option-content">
            <div class="option-info">
              <div class="option-name">
                {{ group.name }}
              </div>
              <div class="option-members">
                {{ formatMemberCount(group.memberCount) }}
              </div>
              <div class="option-label previously-upgraded">
                <div
                  class="svg-icon sparkle-icon"
                  v-html="icons.sparkles"
                ></div>
                {{ $t('previouslyUpgradedGroup') }}
              </div>
            </div>
            <div class="option-price">
              ${{ calculatePrice(group.memberCount) }}.00/mo
            </div>
          </div>
        </selectable-card>

        <selectable-card
          v-if="upgradeableParty"
          class="option-card"
          :class="{ 'has-pending-warning': partyPendingInviteCount > 0 }"
          :selected="isSelected(upgradeableParty)"
          @click="selectOption(upgradeableParty)"
        >
          <div class="option-content">
            <div class="option-info">
              <div class="option-name">
                {{ upgradeableParty.name }}
              </div>
              <div class="option-members">
                {{ formatMemberCount(upgradeableParty.memberCount) }}
                <span
                  v-if="partyPendingInviteCount > 0"
                  class="pending-count"
                >
                  {{ $t('pendingCount', { count: partyPendingInviteCount }) }}
                </span>
              </div>
              <div
                v-if="isPartyPreviouslyUpgraded"
                class="option-label previously-upgraded"
              >
                <div
                  class="svg-icon sparkle-icon"
                  v-html="icons.sparkles"
                ></div>
                {{ $t('previouslyUpgradedGroup') }}
              </div>
              <div
                v-else
                class="option-label your-party"
              >
                <div
                  class="svg-icon member-icon"
                  v-html="icons.member"
                ></div>
                {{ $t('yourParty') }}
              </div>
            </div>
            <div class="option-price">
              ${{ calculatePrice(upgradeableParty.memberCount) }}.00/mo
            </div>
          </div>
          <div
            v-if="partyPendingInviteCount > 0"
            class="pending-warning-banner"
          >
            <div
              class="svg-icon alert-icon"
              v-html="icons.alert"
            ></div>
            <span class="warning-text">{{ $t('upgradeCancelsPendingInvites') }}</span>
          </div>
        </selectable-card>

        <div
          v-if="hasUpgradeableGroups"
          class="or-divider"
        >
          <div class="divider-line"></div>
          <span class="or-text">{{ $t('or') }}</span>
          <div class="divider-line"></div>
        </div>

        <selectable-card
          class="option-card create-new"
          :selected="selectedOption === 'new'"
          @click="selectOption('new')"
        >
          <div class="option-content">
            <div class="option-info">
              <div class="option-name">
                {{ $t('createNewGroup') }}
              </div>
              <div class="option-description">
                {{ $t('inviteOthersForAdditional') }}
                <span class="price-highlight">${{ perMemberPrice }}.00</span>
                {{ $t('perMember') }}.
              </div>
            </div>
            <div class="option-price">
              ${{ basePrice }}.00/mo
            </div>
          </div>
        </selectable-card>

        <div class="footer-note">
          {{ $t('additionalMembersProrated') }}
        </div>
      </template>
    </div>
  </b-modal>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

.selection-modal {
  padding: 24px;
}

.modal-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-family: 'Roboto Condensed', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  color: $purple-200;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
}

.cancel-text {
  color: $blue-10;
  font-size: 0.875rem;
  margin-right: 16px;
  cursor: pointer;
}

.next-button {
  min-width: 64px;

  &.disabled {
    background-color: $gray-300;
    border-color: $gray-300;
    cursor: not-allowed;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.section-header {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  color: $gray-10;
  margin-bottom: 12px;
}

.option-card {
  margin-bottom: 12px;

  ::v-deep .option-name {
    color: $gray-50;
  }

  &.selected ::v-deep .option-name {
    color: $purple-200;
  }
}

.pending-warning-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  background-color: $yellow-50;
  border-radius: 0 0 6px 6px;
  margin: 16px -16px 0 -16px;
  gap: 4px;

  .selected & {
    margin: 15px -15px 0 -15px;
  }

  .alert-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;

    ::v-deep path {
      fill: $gray-10;
    }
  }

  .warning-text {
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: $gray-10;
  }
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-left: 32px;
  padding-right: 8px;
}

.option-info {
  flex: 1;
}

.option-name {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 24px;
  margin-bottom: 4px;
}

.option-members {
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: $gray-100;
  margin-bottom: 8px;

  .pending-count {
    font-weight: 700;
    color: $yellow-5;
  }
}

.option-label {
  display: flex;
  align-items: center;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
  line-height: 16px;
  gap: 4px;

  &.previously-upgraded {
    font-weight: 700;
    color: $blue-10;
  }

  &.your-party {
    font-weight: 700;
    color: $gray-100;
  }

  .svg-icon {
    width: 14px;
    height: 14px;
  }

  .sparkle-icon {
    color: $blue-10;
  }

  .member-icon {
    color: $gray-100;

    ::v-deep path {
      fill: $gray-100;
      stroke: $gray-100;
      stroke-width: 0.5px;
    }
  }
}

.option-description {
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: $gray-100;

  .price-highlight {
    font-weight: 700;
  }
}

.option-price {
  font-family: 'Roboto', sans-serif;
  font-weight: 700;
  font-size: 20px;
  line-height: 24px;
  color: $purple-200;
  white-space: nowrap;
}

.or-divider {
  display: flex;
  align-items: center;
  margin: 20px 0;

  .divider-line {
    flex: 1;
    height: 1px;
    background-color: $gray-500;
  }

  .or-text {
    padding: 0 16px;
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: $gray-100;
  }
}

.create-new {
  .option-name {
    margin-bottom: 8px;
  }
}

.footer-note {
  font-family: 'Roboto', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: $gray-100;
  text-align: center;
  margin-top: 16px;
  margin-left: 24px;
  margin-right: 24px;
}
</style>

<style lang="scss">
#group-plan-selection {
  .modal-dialog {
    max-width: 504px;
  }

  .modal-content {
    border-radius: 8px;
    box-shadow: 0 14px 28px 0 rgba(26, 24, 29, 0.24), 0 10px 10px 0 rgba(26, 24, 29, 0.28);
  }

  .modal-body {
    padding: 0;
  }

  .option-card.has-pending-warning.selectable-card {
    padding-bottom: 0;
  }
}
</style>

<script>
import axios from 'axios';
import paymentsMixin from '@/mixins/payments';
import { mapState } from '@/libs/store';
import SelectableCard from '@/components/ui/selectableCard.vue';
import svgSparkles from '@/assets/svg/sparkles.svg?raw';
import svgMember from '@/assets/svg/member-icon.svg?raw';
import svgAlert from '@/assets/svg/for-css/alert.svg?raw';

export default {
  components: {
    SelectableCard,
  },
  mixins: [paymentsMixin],
  data () {
    return {
      selectedOption: null,
      userGuilds: [],
      userParty: null,
      activeGroupPlanIds: [],
      loading: true,
      basePrice: 9,
      perMemberPrice: 3,
      icons: Object.freeze({
        sparkles: svgSparkles,
        member: svgMember,
        alert: svgAlert,
      }),
      partyPendingInviteCount: 0,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    upgradeableGuilds () {
      return this.userGuilds.filter(group => {
        const leaderId = group.leader?._id || group.leader;
        if (leaderId !== this.user._id) return false;
        const purchased = group.purchased;
        if (!purchased?.wasUpgraded) return false;
        if (this.activeGroupPlanIds.includes(group._id)) return false;
        if (!purchased.dateTerminated) return false;
        return new Date(purchased.dateTerminated) < new Date();
      });
    },
    upgradeableParty () {
      if (!this.userParty) return null;

      const leaderId = this.userParty.leader?._id || this.userParty.leader;
      if (leaderId !== this.user._id) return null;

      if (this.activeGroupPlanIds.includes(this.userParty._id)) return null;

      return this.userParty;
    },
    hasUpgradeableGroups () {
      return this.upgradeableGuilds.length > 0 || this.upgradeableParty !== null;
    },
    isPartyPreviouslyUpgraded () {
      if (!this.userParty) return false;
      const purchased = this.userParty.purchased;
      if (!purchased?.wasUpgraded) return false;
      if (!purchased.dateTerminated) return false;
      return new Date(purchased.dateTerminated) < new Date();
    },
  },
  methods: {
    async loadData () {
      this.loading = true;
      this.selectedOption = null;
      this.partyPendingInviteCount = 0;

      try {
        const [guildsResponse, partyResponse] = await Promise.all([
          axios.get('/api/v4/groups', { params: { type: 'guilds', includeExpiredPlans: 'true' } }),
          axios.get('/api/v4/groups/party').catch(() => ({ data: { data: null } })),
        ]);

        this.userGuilds = guildsResponse.data.data || [];
        this.userParty = partyResponse.data.data;

        if (this.userParty) {
          try {
            const invitesResponse = await axios.get(`/api/v4/groups/${this.userParty._id}/invites`);
            this.partyPendingInviteCount = invitesResponse.data.data?.length || 0;
          } catch (e) {
            this.partyPendingInviteCount = 0;
          }
        }

        await this.$store.dispatch('guilds:getGroupPlans', true);
        const groupPlans = this.$store.state.groupPlans?.data || [];
        this.activeGroupPlanIds = groupPlans.map(g => g._id);
      } catch (e) {
        console.error('Error loading group data:', e);
      }

      this.loading = false;

      this.$nextTick(() => {
        if (this.upgradeableGuilds.length > 0) {
          this.selectedOption = this.upgradeableGuilds[0];
        } else if (this.upgradeableParty) {
          this.selectedOption = this.upgradeableParty;
        } else {
          this.selectedOption = 'new';
        }
      });
    },
    selectOption (option) {
      this.selectedOption = option;
    },
    isSelected (group) {
      if (!this.selectedOption || this.selectedOption === 'new') return false;
      return this.selectedOption._id === group._id;
    },
    calculatePrice (memberCount) {
      return this.basePrice + (this.perMemberPrice * (memberCount - 1));
    },
    formatMemberCount (count) {
      return count === 1 ? this.$t('oneMember') : this.$t('membersCount', { count });
    },
    continueFlow () {
      if (!this.selectedOption) return;

      const selection = this.selectedOption;
      this.close();

      if (selection === 'new') {
        this.$root.$emit('bv::show::modal', 'create-group');
      } else {
        this.stripeGroup({ group: selection, upgrade: true });
      }
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'group-plan-selection');
    },
    onHide () {
      this.selectedOption = null;
    },
  },
};
</script>
