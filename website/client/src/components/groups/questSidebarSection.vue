<template>
  <sidebar-section :title="$t('questDetails')">
    <div
      v-if="!onPendingQuest && !onActiveQuest"
      class="row no-quest-section"
    >
      <div class="col-12 text-center">
        <div
          v-once
          class="svg-icon quest-icon color"
          v-html="icons.questIcon"
        ></div>
        <h4 v-once>
          {{ $t('yourPartyIsNotOnQuest') }}
        </h4>
        <p v-once>
          {{ $t('questDescription') }}
        </p>
        <button
          v-once
          class="btn btn-secondary"
          @click="openSelectQuestModal()"
        >
          {{ $t('selectQuest') }}
        </button>
      </div>
    </div>
    <div
      v-if="user.party.quest && user.party.quest.RSVPNeeded"
      class="quest-active-section quest-invite"
    >
      <span class="participate">{{ $t('invitedToThisQuest') }}</span>
      <div class="buttons">
        <button
          class="btn btn-success accept"
          @click="questAccept(group._id)"
        >
          {{ $t('accept') }}
        </button>
        <button
          class="btn btn-danger reject"
          @click="questReject(group._id)"
        >
          {{ $t('reject') }}
        </button>
      </div>
    </div>
    <div
      v-if="!onPendingQuest && onActiveQuest"
      class="row quest-active-section"
      :class="{'not-participating': !userIsOnQuest}"
    >
      <div class="col-12 text-center">
        <div
          class="quest-boss"
          :class="'quest_' + questData.key"
        ></div>
        <div class="quest-box">
          <div
            v-if="questData.collect"
            class="collect-info"
          >
            <div
              v-for="(value, key) in questData.collect"
              :key="key"
              class="quest-item-row"
            >
              <div class="quest-item-icon">
                <div :class="'quest_' + questData.key + '_' + key"></div>
              </div>
              <div class="quest-item-info">
                <span class="label quest-label">{{ value.text() }}</span>
                <div class="grey-progress-bar">
                  <div
                    class="collect-progress-bar"
                    :style="{width: (group.quest.progress.collect[key] / value.count) * 100 + '%'}"
                  ></div>
                </div>
                <div class="item-progress-row">
                  <span
                    class="label item-progress"
                    :class="{'no-items': group.quest.progress.collect[key] === 0}"
                  >
                    {{ group.quest.progress.collect[key] }} / {{ value.count }}
                  </span>
                </div>
              </div>
            </div>
            <div
              v-if="hasPendingQuestItems"
              class="item-progress-pending mb-2"
            >
              <div class="pending-amount pt-2 pb-2">
                {{ $t('questItemsPending', { amount: user.party.quest.progress.collectedItems }) }}
              </div>
            </div>
          </div>
          <div
            v-if="questData.boss"
            class="boss-info"
          >
            <div class="row">
              <div class="col-12">
                <h4
                  v-once
                  class="float-left boss-name"
                >
                  {{ questData.boss.name() }}
                </h4>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="grey-progress-bar">
                  <div
                    class="boss-health-bar"
                    :style="{width: bossHpPercent + '%'}"
                  >
                    <div
                      class="pending-health-bar"
                      :style="{width: pendingHpInBossHpPercent + '%'}"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row boss-details">
              <div class="col-6">
                <span class="float-left hp-value">
                  <div
                    v-once
                    class="svg-icon health-icon"
                    v-html="icons.healthNoPaddingIcon"
                  ></div>
                  {{
                    (Math.ceil(parseFloat(group.quest.progress.hp) * 100) / 100)
                      | localizeNumber(user.preferences.language, { toFixed:2 })
                  }} / {{
                    parseFloat(questData.boss.hp)
                      | localizeNumber(user.preferences.language, { toFixed:2 })
                  }}
                  <strong>HP</strong>

                  <!-- current boss hp uses ceil so
                    you don't underestimate damage needed to end quest-->
                </span>
              </div>
              <div
                v-if="userIsOnQuest && user.party.quest.progress.up"
                class="col-6"
              >
                <!-- @TODO: Why do we not sync quest
                  progress on the group doc? Each user could have different progress.-->
                <span class="float-right pending-value">
                  <div
                    v-once
                    class="svg-icon sword-icon"
                    v-html="icons.swordIcon"
                  ></div>
                  {{
                    (user.party.quest.progress.up || 0)
                      | floor(10)
                      | localizeNumber(user.preferences.language, { toFixed:1 })
                  }}
                  {{ $t('pendingDamageLabel') }}
                </span>
                <!-- player's pending damage uses floor so you
                  don't overestimate damage you've already done-->
              </div>
            </div>
            <div
              v-if="questData.boss.rage"
              class="row rage-bar-row"
            >
              <div class="col-12">
                <div class="grey-progress-bar">
                  <div
                    class="boss-health-bar rage-bar"
                    :style="{
                      width: (group.quest.progress.rage / questData.boss.rage.value) * 100 + '%'}"
                  ></div>
                </div>
              </div>
            </div>
            <div
              v-if="questData.boss.rage"
              class="row boss-details rage-details"
            >
              <div class="col-6">
                <span class="float-left rage-value">
                  <div
                    v-once
                    class="svg-icon rage-icon icon-16"
                    v-html="icons.rageIcon"
                  >
                  </div>
                  <span
                    class="float-left"
                  >{{ $t('rage') }} {{
                    parseFloat(group.quest.progress.rage)
                      | localizeNumber(user.preferences.language, { toFixed: 2 })
                  }} / {{
                    questData.boss.rage.value
                      | localizeNumber(user.preferences.language)
                  }}</span>
                  <strong v-once>{{ $t('rage') }}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="onPendingQuest || onActiveQuest"
      class="quest-pending-section"
    >
      <div class="titles">
        <strong>{{ questData.text() }} </strong>
        <a
          class="members-invited"
          @click="openParticipantList()"
        >
          {{ $t('membersParticipating', {accepted: acceptedCount, invited: group.memberCount}) }}
        </a>
      </div>
      <div class="quest-icon">
        <div
          class="quest"
          :class="`inventory_quest_scroll_${questData.key}`"
        ></div>
      </div>
    </div>
    <div
      v-if="onPendingQuest || onActiveQuest"
      class="quest-buttons"
    >
      <button
        class="btn btn-secondary w-100"
        @click="openQuestDetails()"
      >
        {{ $t('viewDetails') }}
      </button>
    </div>
    <div
      v-if="userIsQuestLeader && !onActiveQuest"
      class="quest-buttons"
    >
      <button
        class="btn btn-success w-100"
        @click="startQuest()"
      >
        {{ $t('startQuest') }}
      </button>
    </div>
    <div
      v-if="userIsOnQuest && !userIsQuestLeader"
      class="leave-quest-holder"
    >
      <a
        v-once
        class="leave-quest text-center"
        @click="questLeave()"
      >
        {{ $t('leaveQuest') }}
      </a>
    </div>
  </sidebar-section>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .svg-icon {
    height: 25px;
    width: 25px;
  }

  .quest-buttons {
    margin-bottom: 0.25rem;

    &:nth-last-of-type(2) {
      margin-bottom: 0;
    }
  }

  .quest-buttons + .quest-buttons {
    margin-top: 0.25rem;
  }

  .quest-boss {
    margin: 0 auto 1.188rem;
  }

  .boss-health-bar {
    background-color: $red-50;
    height: 0.75rem;

    display: inline-block;
    position: relative;
  }

  .pending-health-bar {
    height: 0.75rem;
    background-color: $yellow-50;
    display: inline-block;

    position: absolute;
    right: 0;
  }

  .rage-details {
  }

  .boss-health-bar.rage-bar {
    background-color: $orange-50;
  }

  .grey-progress-bar {
    width: 100%;
    height: 0.75rem;
    background-color: #e1e0e3;
    border-radius: 2px;
    overflow: hidden;
    display: flex;
  }

  .collect-progress-bar {
    background-color: #24cc8f;
    height: 15px;
    max-width: 100%;
  }

  .no-quest-section {
    padding: 2em;

    h4 {
      margin-bottom: 0;
    }

    p {
      margin-bottom: 1em;
      color: $gray-100;
      font-size: 0.75rem;
      line-height: 1.33;
    }

    .quest-icon {
      width: 1.125rem;
      height: 1.25rem;
      margin: 0 auto 0.5em;
      object-fit: contain;
      border-radius: 2px;
      color: $gray-200;
    }
  }

  .quest-pending-section {
    display: flex;
    margin-bottom: 0.5rem;

    .titles {
      flex: 1;
      margin-top: 1rem;
      font-size: 0.75rem;
      line-height: 1.33;

      strong {
        display: block;
        min-height: 1rem;
        font-weight: bold;
        font-size: 0.75rem;
        line-height: 1.33;
        color: $gray-100;
        margin-bottom: 0.25rem;
      }

      .members-invited {
        min-height: 1rem;
        margin: 0;

        &:hover, &:focus {
          text-decoration: underline;
        }
      }
    }

    .quest-icon {
      width: 4.25rem;
      height: 4.25rem;
    }
  }

  .quest-active-section {
    margin-bottom: 0.5rem;

    .participate {
      font-size: 0.75rem;
      font-weight: bold;
      line-height: 1.33;
      color: $white;
    }

    .titles {
      padding-top: .5em;
    }

    .quest-box {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      background-color: $white;

      a {
        font-family: 'Roboto Condensed', sans-serif;
        font-weight: bold;
        color: $gray-10;
      }

      svg: {
        width: 100%;
        height: 100%;
      }
    }

    .boss-info {
      text-align: left;

      .boss-name {
        font-size: 0.75rem;
        font-weight: bold;
        line-height: 1.33;
        color: $gray-100;
        margin-bottom: 0.25rem;
      }

      .boss-details {
        margin-top: 0.5rem;
      }

      .hp-value {
        font-size: 0.75rem;
        line-height: 1.33;
        color: $maroon-10;
        display: flex;
      }

      .rage-value {
        font-size: 0.75rem;
        line-height: 1.33;
        color: $orange-10;
        display: flex;
        height: 1rem;

        .span {
          align-self: center;
        }
      }

      .pending-value {
        font-size: 0.75rem;
        line-height: 1.33;
        text-align: right;
        color: $yellow-5;

        display: flex;
      }

      .health-icon {
        width: 1rem;
        height: 1rem;
        object-fit: contain;
        margin-right: 0.25rem;
      }

      .rage-icon {
        width: 1rem;
        height: 1rem;
        object-fit: contain;
        margin-right: 0.25rem;

        ::v-deep svg {
          height: 1rem;
        }
      }

      .sword-icon {
        width: 1rem;
        height: 1rem;
        object-fit: contain;
        margin-right: 0.25rem;
      }

      strong {
        margin-left: 0.25rem;
      }
    }
  }

  .quest-invite {
    background-color: $blue-10;
    color: $white;
    display: flex;
    border-radius: 2px;

    .participate {
      margin-top: 0.75rem;
      margin-bottom: 0.75rem;
      margin-left: 1rem;
      flex: 1;
    }

    .buttons {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      margin-right: 0.5rem;
    }

    .accept, .reject {
      font-size: 0.75rem;
      font-weight: bold;

      line-height: 1.33;
      text-align: center;
      color: $white;
      border-radius: 2px;
    }

    .accept {
      margin: 0 0.5rem 0 0;
    }

    .reject {
    }
  }

  .leave-quest-holder {
    display: flex;
    justify-content: center;
  }

  .leave-quest {
    font-size: 0.875rem;
    line-height: 1.71;
    color: $maroon-50;
    display: block;
    margin-top: 1rem;

    &:hover, &:focus {
      color: $maroon-50;
      text-decoration: underline;
    }

    &.disabled {
      color: $gray-200;
      cursor: default;
      pointer-events: none;
    }
  }

  .quest-item-row {
    display: flex;
    margin-bottom: 0.25rem;

    .quest-item-icon {
      margin-right: 0.813rem;
      width: 3.5rem;
      height: 3.5rem;

      display: flex;
      align-items: center;
      justify-content: center;

      align-self: center;
    }

    .quest-item-info {
      flex: 1;
      text-align: left;

      .label {
        font-size: 0.75rem;
        line-height: 1.33;
        color: $gray-100;

        &.quest-label {
          font-weight: bold;
          margin-bottom: 0.25rem;
          display: block;
        }
      }

      .item-progress-row {
        margin-top: 0.5rem;
        display: flex;

        > * {
          flex: 1;
        }
      }

      .item-progress:not(.no-items) {
        color: $green-10;
      }

      .item-progress-label {
        text-align: right;
        color: $gray-100;
      }
    }
  }

  .item-progress-pending {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-left: -1rem;
    margin-right: -1rem;
    margin-bottom: -1rem !important;

    background-color: $gray-200;

    .pending-amount {
      font-size: 12px;
      font-weight: bold;
      line-height: 1.33;
      text-align: center;

      color: $white;
    }
  }

  .not-participating {
    opacity: 0.5;
  }

  .rage-bar-row {
    margin-top: 0.875rem;
  }
</style>

<script>
import { mapState } from '@/libs/store';

import * as quests from '@/../../common/script/content/quests';
import percent from '@/../../common/script/libs/percent';
import sidebarSection from '../sidebarSection';

import questIcon from '@/assets/svg/quest.svg';
import swordIcon from '@/assets/svg/sword.svg';
import rageIcon from '@/assets/svg/rage.svg';
import healthNoPaddingIcon from '@/assets/svg/health_no_padding.svg';
import questActionsMixin from '@/components/groups/questActions.mixin';

export default {
  components: {
    sidebarSection,
  },
  mixins: [questActionsMixin],
  props: ['group'],
  data () {
    return {
      icons: Object.freeze({
        questIcon,
        healthNoPaddingIcon,
        swordIcon,
        rageIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    userIsOnQuest () {
      if (!this.group.quest || !this.group.quest.members) return false;
      return Boolean(this.group.quest.members[this.user._id]);
    },
    userIsQuestLeader () {
      if (!this.group.quest) return false;
      return this.group.quest.leader === this.user._id;
    },
    onPendingQuest () {
      return Boolean(this.group.quest.key) && !this.group.quest.active;
    },
    bossHpPercent () {
      return percent(this.group.quest.progress.hp, this.questData.boss.hp);
    },
    pendingHpPercent () {
      return percent(this.user.party.quest.progress.up, this.questData.boss.hp);
    },
    pendingHpInBossHpPercent () {
      // Pending more than the current hp left, it is the full % of the pending bar
      if (this.user.party.quest.progress.up > this.group.quest.progress.hp) {
        return 100;
      }

      // otherwise the percent inside that hp bar is needed
      return percent(this.user.party.quest.progress.up, this.group.quest.progress.hp);
    },
    questData () {
      if (!this.group.quest) return {};
      return quests.quests[this.group.quest.key];
    },
    canEditQuest () {
      if (!this.group.quest) return false;
      const isPartyLeader = this.group.leader._id === this.user._id;
      return this.userIsQuestLeader || isPartyLeader;
    },
    isMemberOfPendingQuest () {
      const userid = this.user._id;
      const { group } = this;
      if (!group.quest || !group.quest.members) return false;
      if (group.quest.active) return false; // quest is started, not pending
      return userid in group.quest.members && group.quest.members[userid] !== false;
    },
    isMemberOfRunningQuest () {
      const userid = this.user._id;
      const { group } = this;
      if (!group.quest || !group.quest.members) return false;
      if (!group.quest.active) return false; // quest is pending, not started
      return group.quest.members[userid];
    },
    acceptedCount () {
      let count = 0;

      if (!this.group || !this.group.quest) return count;

      for (const uuid in this.group.quest.members) {
        if (this.group.quest.members[uuid]) count += 1;
      }

      return count;
    },
    hasPendingQuestItems () {
      return Boolean(this.user.party.quest?.progress?.collectedItems);
    },
  },
  methods: {
    openSelectQuestModal () {
      this.$root.$emit('bv::show::modal', 'quest-detail-modal');
    },
    openQuestDetails () {
      this.$root.$emit('bv::show::modal', 'quest-detail-modal', {
        key: this.group.quest.key,
        from: 'sidebar',
      });
    },
    openParticipantList () {
      if (this.onPendingQuest) {
        this.$root.$emit('bv::show::modal', 'invitation-list');
      } else {
        this.$root.$emit('bv::show::modal', 'participant-list');
      }
    },
    async questLeave () {
      if (!window.confirm(this.$t(this.group.quest.active ? 'sureLeave' : 'sureLeaveInactive'))) {
        return;
      }

      const quest = await this.$store.dispatch('quests:sendAction', { groupId: this.group._id, action: 'quests/leave' });
      this.group.quest = quest;
    },
    async questAccept (partyId) {
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: partyId, action: 'quests/accept' });
      this.user.party.quest = quest;
      this.group.quest = quest;
    },
    async questReject (partyId) {
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: partyId, action: 'quests/reject' });
      this.user.party.quest = quest;
    },
    startQuest () {
      this.questActionsConfirmQuest();
    },
  },
};
</script>
