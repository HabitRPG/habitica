<template>
  <sidebar-section :title="$t('questDetailsTitle')">
    <div
      v-if="!onPendingQuest && !onActiveQuest"
      class="row no-quest-section"
    >
      <div class="col-12 text-center">
        <div
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
          @click="openStartQuestModal()"
        >
          {{ $t('selectQuest') }}
        </button>
      </div>
    </div>
    <div
      v-if="user.party.quest && user.party.quest.RSVPNeeded"
      class="quest-active-section quest-invite"
    >
      <span class="participate">{{ $t('wouldYouParticipate') }}</span>
      <div class="buttons">
        <button
          class="btn btn-primary accept"
          @click="questAccept(group._id)"
        >
          {{ $t('accept') }}
        </button>
        <button
          class="btn btn-primary reject"
          @click="questReject(group._id)"
        >
          {{ $t('reject') }}
        </button>
      </div>
    </div>
    <div v-if="userIsQuestLeader && !onActiveQuest">
      <button
        class="btn btn-success full-width"
        @click="startQuest()"
      >
        {{ $t('startQuest') }}
      </button>
    </div>
    <div
      v-if="!onPendingQuest && onActiveQuest"
      class="row quest-active-section"
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
                  <span class="label item-progress">
                    {{ group.quest.progress.collect[key] }} / {{ value.count }}
                  </span>
                  <div
                    v-if="userIsOnQuest"
                    class="label item-progress-label"
                  >
                    {{ parseFloat(user.party.quest.progress.collectedItems) || 0 }} items found
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div
            v-if="questData.boss"
            class="boss-info"
          >
            <div class="row">
              <div class="col-6">
                <h4
                  v-once
                  class="float-left"
                >
                  {{ questData.boss.name() }}
                </h4>
              </div>
              <div class="col-6">
                <a
                  class="float-right"
                  @click="openParticipantList()"
                >{{ $t('participantsTitle') }}</a>
              </div>
            </div>
            <div class="row">
              <div class="col-12">
                <div class="grey-progress-bar">
                  <div
                    class="boss-health-bar"
                    :style="{width: bossHpPercent + '%'}"
                  ></div>
                </div>
              </div>
            </div>
            <div class="row boss-details">
              <div class="col-6">
                <span class="float-left">
                  {{ Math.ceil(parseFloat(group.quest.progress.hp) * 100) / 100 }} / {{ parseFloat(questData.boss.hp).toFixed(2) }} <!-- eslint-disable-line max-len -->
                  <!-- current boss hp uses ceil so
                    you don't underestimate damage needed to end quest-->
                </span>
              </div>
              <div
                v-if="userIsOnQuest"
                class="col-6"
              >
                <!-- @TODO: Why do we not sync quest
                  progress on the group doc? Each user could have different progress.-->
                <span
                  class="float-right"
                >{{ (user.party.quest.progress.up || 0) | floor(10) }} {{ $t('pendingDamageLabel') }}</span> <!-- eslint-disable-line max-len -->
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
                <span
                  class="float-left"
                >{{ $t('rage') }} {{ parseFloat(group.quest.progress.rage).toFixed(2) }} / {{ questData.boss.rage.value }}</span> <!-- eslint-disable-line max-len -->
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
          @click="openQuestDetails()"
        >
          {{ $t('membersAccepted', {accepted: acceptedCount, invited: group.memberCount}) }}
        </a>
      </div>
      <div class="quest-icon">
        <div
          class="quest"
          :class="`inventory_quest_scroll_${questData.key}`"
        ></div>
      </div>
    </div>
    <div v-if="onPendingQuest || onActiveQuest">
      <button
        class="btn btn-secondary full-width mb-1"
        @click="openQuestDetails()"
      >
        {{ $t('details') }}
      </button>
    </div>
    <div v-if="userIsQuestLeader && !onActiveQuest">
      <a
        class="abandon-quest text-center full-width"
        @click="abandonQuest()"
      >
        {{ $t('abandonQuest') }}
      </a>
    </div>
    <div v-if="canEditQuest && onActiveQuest">
     <a
        v-once
        class="abandon-quest text-center full-width"
        @click="questAbort()"
      >
        {{ $t('abandonQuest') }}
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

  .quest-boss {
    margin: 0 auto 1.188rem;
  }

  .boss-health-bar {
    width: 80%;
    background-color: red;
    height: 15px;
    margin-bottom: .5em;
  }

  .rage-details {
    margin-bottom: 1em;
  }

  .boss-health-bar.rage-bar {
    margin-top: 1em;
    background-color: orange;
  }

  .grey-progress-bar {
    width: 100%;
    height: 15px;
    background-color: #e1e0e3;
    border-radius: 2px;
    overflow: hidden;
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
        color: $blue-10;
        margin: 0;

        &:hover, &:focus {
          color: $blue-10;
          text-decoration: underline;
        }
      }
    }

    .quest-icon {
      width: 4.25rem;
      height: 4.25rem;
    }
  }

  .full-width {
    width: 100%;
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
      width: 90%;
      margin: 0 auto;
      text-align: left;
    }
  }

  .quest-invite {
    background-color: #2995cd;
    color: #fff;
    display: flex;

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
      padding: .2em 1em;
      font-size: 12px;
      height: 24px;
      border-radius: 2px;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    }

    .accept {
      background-color: #24cc8f;
      margin-left: 4em;
      margin-right: .5em;
    }

    .reject {
      border-radius: 2px;
      background-color: #f74e52;
    }
  }

  .abandon-quest {
    font-size: 0.875rem;
    line-height: 1.71;
    color: $maroon-50;
    width: 100%;
    display: block;
    margin-top: 1rem;

    &:hover, &:focus {
      color: $maroon-50;
      text-decoration: underline;
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
        }
      }

      .item-progress-row {
        margin-top: 0.5rem;
        display: flex;

        > * {
          flex: 1;
        }
      }

      .item-progress {
        color: $green-10;
      }

      .item-progress-label {
        text-align: right;
        color: $gray-100;
      }
    }
  }
</style>

<script>
import { mapState } from '@/libs/store';

import * as quests from '@/../../common/script/content/quests';
import percent from '@/../../common/script/libs/percent';
import sidebarSection from '../sidebarSection';

import questIcon from '@/assets/svg/quest.svg';
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
    onActiveQuest () {
      return this.group.quest.active;
    },
    bossHpPercent () {
      return percent(this.group.quest.progress.hp, this.questData.boss.hp);
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
  },
  methods: {
    openStartQuestModal () {
      this.$root.$emit('bv::show::modal', 'start-quest-modal');
    },
    openQuestDetails () {
      this.$root.$emit('bv::show::modal', 'quest-details');
    },
    openParticipantList () {
      this.$root.$emit('bv::show::modal', 'participant-list');
    },
    async questAbort () {
      if (!window.confirm(this.$t('sureAbort'))) return; // eslint-disable-line no-alert
      if (!window.confirm(this.$t('doubleSureAbort'))) return; // eslint-disable-line no-alert
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: this.group._id, action: 'quests/abort' });
      this.group.quest = quest;
    },
    async questLeave () {
      if (!window.confirm(this.$t('sureLeave'))) return; // eslint-disable-line no-alert
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
    abandonQuest () {
      this.questActionsCancelQuest();
    },
  },
};
</script>
