<template>
  <b-modal
    id="start-quest-modal"
    title="Empty"
    size="md"
    :hide-footer="true"
    :hide-header="true"
  >
    <div class="left-panel content">
      <h3 class="text-center">
        Quests
      </h3>
      <div class="row">
        <!-- eslint-disable vue/no-use-v-if-with-v-for -->
        <div
          v-for="(value, key) in user.items.quests"
          v-if="value > 0"
          :key="key"
          class="col-4 quest-col"
          :class="{selected: key === selectedQuest}"
          @click="selectQuest({key})"
        >
          <!-- eslint-enable vue/no-use-v-if-with-v-for -->
          <div class="quest-wrapper">
            <b-popover
              :target="`inventory_quest_scroll_${key}`"
              placement="top"
              triggers="hover"
            >
              <h4 class="popover-content-title">
                {{ quests.quests[key].text() }}
              </h4>
              <questInfo :quest="quests.quests[key]" />
            </b-popover>
            <div
              :id="`inventory_quest_scroll_${key}`"
              class="quest"
              :class="`inventory_quest_scroll_${key}`"
            ></div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-10 offset-1 text-center">
          <span
            v-once
            class="description"
          >{{ $t('noQuestToStart') }}</span>
        </div>
      </div>
    </div>
    <div v-if="questData">
      <questDialogContent :item="questData" />
    </div>
    <div class="text-center">
      <button
        class="btn btn-primary"
        :disabled="!Boolean(selectedQuest) || loading"
        @click="questInit()"
      >
        {{ $t('inviteToPartyOrQuest') }}
      </button>
    </div>
    <div class="text-center">
      <p>{{ $t('inviteInformation') }}</p>
    </div>
    <div
      v-if="questData"
      class="side-panel"
    >
      <questDialogDrops :item="questData" />
    </div>
  </b-modal>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  header {
    background-color: $white !important;
    border: none !important;

    h5 {
      text-indent: -99999px;
    }
  }

  .quest-details {
    margin: 0 auto;
    text-align: left;
    width: 180px;
  }

  .btn-primary {
    margin: 1em 0;
  }

  .left-panel {
    background: #4e4a57;
    color: $white;
    position: absolute;
    height: 460px;
    width: 320px;
    top: 2.5em;
    left: -23em;
    z-index: -1;
    padding: 2em;
    overflow-y: auto;

    h3 {
      color: $white;
    }

    .selected .quest-wrapper {
      border: solid 1.5px #9a62ff;
    }

    .quest-wrapper:hover {
      cursor: pointer;
    }

    .quest-col .quest-wrapper {
      background: $white;
      padding: .2em;
      margin-bottom: 1em;
      border-radius: 3px;
    }

    .description {
      text-align: center;
      color: #a5a1ac;
      font-size: 12px;
    }
  }

  .side-panel {
    position: absolute;
    right: -350px;
    top: 25px;
    border-radius: 8px;
    background-color: $gray-600;
    box-shadow: 0 2px 16px 0 rgba(26, 24, 29, 0.32);
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 364px;
    z-index: -1;
    height: 93%;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import * as Analytics from '@/libs/analytics';

import * as quests from '@/../../common/script/content/quests';

import copyIcon from '@/assets/svg/copy.svg';
import greyBadgeIcon from '@/assets/svg/grey-badge.svg';
import qrCodeIcon from '@/assets/svg/qrCode.svg';
import facebookIcon from '@/assets/svg/facebook.svg';
import twitterIcon from '@/assets/svg/twitter.svg';
import starIcon from '@/assets/svg/star.svg';
import goldIcon from '@/assets/svg/gold.svg';
import difficultyStarIcon from '@/assets/svg/difficulty-star.svg';
import questDialogDrops from '../shops/quests/questDialogDrops';
import questDialogContent from '../shops/quests/questDialogContent';
import QuestInfo from '../shops/quests/questInfo';

export default {
  components: {
    questDialogDrops,
    questDialogContent,
    QuestInfo,
  },
  props: ['group'],
  data () {
    return {
      loading: false,
      selectedQuest: {},
      icons: Object.freeze({
        copy: copyIcon,
        greyBadge: greyBadgeIcon,
        qrCode: qrCodeIcon,
        facebook: facebookIcon,
        twitter: twitterIcon,
        starIcon,
        goldIcon,
        difficultyStarIcon,
      }),
      shareUserIdShown: false,
      quests,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    questData () {
      return quests.quests[this.selectedQuest];
    },
  },
  mounted () {
    const userQuests = this.user.items.quests;
    for (const key in userQuests) {
      if (userQuests[key] > 0) {
        this.selectedQuest = key;
        break;
      }
    }

    this.$root.$on('selectQuest', this.selectQuest);
  },
  beforeDestroy () {
    this.$root.$off('selectQuest', this.selectQuest);
  },
  methods: {
    selectQuest (quest) {
      this.selectedQuest = quest.key;
    },
    async questInit () {
      this.loading = true;

      Analytics.updateUser({
        partyID: this.group._id,
        partySize: this.group.memberCount,
      });

      const groupId = this.group._id || this.user.party._id;

      const key = this.selectedQuest;
      try {
        const response = await this.$store.dispatch('guilds:inviteToQuest', { groupId, key });
        const quest = response.data.data;

        if (this.$store.state.party.data) this.$store.state.party.data.quest = quest;
      } finally {
        this.loading = false;
      }
      this.$root.$emit('bv::hide::modal', 'start-quest-modal');
    },
  },
};
</script>
