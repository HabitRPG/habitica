<template>
  <sidebar-section :title="$t('questDetailsTitle')">
    <div
      v-if="!onPendingQuest && !onActiveQuest"
      class="row no-quest-section"
    >
      <div class="col-12 text-center">
        <div
          class="svg-icon"
          v-html="icons.questIcon"
        ></div>
        <h4 v-once>
          {{ $t('youAreNotOnQuest') }}
        </h4>
        <p v-once>
          {{ $t('questDescription') }}
        </p>
        <button
          v-once
          class="btn btn-secondary"
          @click="openStartQuestModal()"
        >
          {{ $t('startAQuest') }}
        </button>
      </div>
    </div>
    <div
      v-if="onPendingQuest && !onActiveQuest"
      class="row quest-active-section"
    >
      <div class="col-2">
        <div
          class="quest"
          :class="`inventory_quest_scroll_${questData.key}`"
        ></div>
      </div>
      <div class="col-6 titles">
        <strong>{{ questData.text() }}</strong>
        <p>{{ acceptedCount }} / {{ group.memberCount }}</p>
      </div>
      <div class="col-4">
        <button
          class="btn btn-secondary"
          @click="openQuestDetails()"
        >
          {{ $t('details') }}
        </button>
      </div>
    </div>
    <div
      v-if="user.party.quest && user.party.quest.RSVPNeeded"
      class="row quest-active-section quest-invite"
    >
      <span>{{ $t('wouldYouParticipate') }}</span>
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
    <div
      v-if="!onPendingQuest && onActiveQuest"
      class="row quest-active-section"
    >
      <div class="col-12 text-center">
        <div
          class="quest-boss"
          :class="'quest_' + questData.key"
        ></div>
        <h3 v-once>
          {{ questData.text() }}
        </h3>
        <div class="quest-box">
          <div
            v-if="questData.collect"
            class="collect-info"
          >
            <div class="row">
              <div class="col-12">
                <a
                  class="float-right"
                  @click="openParticipantList()"
                >{{ $t('participantsTitle') }}</a>
              </div>
            </div>
            <div
              v-for="(value, key) in questData.collect"
              :key="key"
              class="row"
            >
              <div class="col-2">
                <div :class="'quest_' + questData.key + '_' + key"></div>
              </div>
              <div class="col-10">
                <strong>{{ value.text() }}</strong>
                <div class="grey-progress-bar">
                  <div
                    class="collect-progress-bar"
                    :style="{width: (group.quest.progress.collect[key] / value.count) * 100 + '%'}"
                  ></div>
                </div>
                <strong>{{ group.quest.progress.collect[key] }} / {{ value.count }}</strong>
              </div>
            </div>
            <div
              v-if="userIsOnQuest"
              class="text-right"
            >
              {{ parseFloat(user.party.quest.progress.collectedItems) || 0 }} items found
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
                >{{ user.party.quest.progress.up | floor(10) }} {{ $t('pendingDamageLabel') }}</span> <!-- eslint-disable-line max-len -->
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
        <button
          v-if="canEditQuest"
          v-once
          class="btn btn-secondary"
          @click="questAbort()"
        >
          {{ $t('abort') }}
        </button>
      </div>
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
    margin: 0 auto;
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
  }

  .collect-progress-bar {
    background-color: #24cc8f;
    height: 15px;
    max-width: 100%;
  }

  .no-quest-section {
    padding: 2em;
    color: $gray-300;

    h4 {
      color: $gray-300;
    }

    p {
      margin-bottom: 2em;
    }

    .svg-icon {
      height: 30px;
      width: 30px;
      margin: 0 auto;
      margin-bottom: 2em;
    }
  }

  .quest-active-section {
    .titles {
        padding-top: .5em;
    }

    .quest-box {
      background-image: url('~@/assets/svg/for-css/quest-border.svg');
      background-size: 100% 100%;
      width: 100%;
      padding: .5em;
      margin-bottom: 1em;

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

    .boss-info, .collect-info {
      width: 90%;
      margin: 0 auto;
      text-align: left;
    }
  }

  .quest-invite {
    background-color: #2995cd;
    color: #fff;
    padding: 1em;

    span {
      margin-top: .3em;
      font-size: 14px;
      font-weight: bold;
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
</style>

<script>
import { mapState } from '@/libs/store';

import * as quests from '@/../../common/script/content/quests';
import percent from '@/../../common/script/libs/percent';
import sidebarSection from '../sidebarSection';

import questIcon from '@/assets/svg/quest.svg';

export default {
  components: {
    sidebarSection,
  },
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
      const isQuestLeader = this.group.quest.leader === this.user._id;
      const isPartyLeader = this.group.leader._id === this.user._id;
      return isQuestLeader || isPartyLeader;
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
      if (!window.confirm(this.$t('sureAbort'))) return;
      if (!window.confirm(this.$t('doubleSureAbort'))) return;
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: this.group._id, action: 'quests/abort' });
      this.group.quest = quest;
    },
    async questLeave () {
      if (!window.confirm(this.$t('sureLeave'))) return;
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: this.group._id, action: 'quests/leave' });
      this.group.quest = quest;
    },
    async questAccept (partyId) {
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: partyId, action: 'quests/accept' });
      this.user.party.quest = quest;
    },
    async questReject (partyId) {
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: partyId, action: 'quests/reject' });
      this.user.party.quest = quest;
    },
  },
};
</script>
