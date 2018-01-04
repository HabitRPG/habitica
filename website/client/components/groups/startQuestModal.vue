<template lang="pug">
  b-modal#start-quest-modal(title="Empty", size='md', :hide-footer="true", :hide-header="true")
    .left-panel.content
      h3.text-center Quests
      .row
        .col-4.quest-col(
          v-for='(value, key, index) in user.items.quests',
          @click='selectQuest({key})',
          :class="{selected: key === selectedQuest}", v-if='value > 0')
          .quest-wrapper
            b-popover(
              :target="`inventory_quest_scroll_${key}`"
               placement="top"
               triggers="hover")
                 h4.popover-content-title {{ quests.quests[key].text() }}
                 questInfo(:quest="quests.quests[key]")
            .quest(:class="`inventory_quest_scroll_${key}`", :id="`inventory_quest_scroll_${key}`")
      .row
        .col-10.offset-1.text-center
          span.description(v-once) {{ $t('noQuestToStart') }}
    div(v-if='questData')
      questDialogContent(:item="questData")
    div.text-center
      button.btn.btn-primary(@click='questInit()', :disabled="!Boolean(selectedQuest) || loading") {{$t('inviteToPartyOrQuest')}}
    div.text-center
      p {{$t('inviteInformation')}}
    .side-panel(v-if='questData')
      questDialogDrops(:item="questData")
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

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
import { mapState } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';

import quests from 'common/script/content/quests';

import copyIcon from 'assets/svg/copy.svg';
import greyBadgeIcon from 'assets/svg/grey-badge.svg';
import qrCodeIcon from 'assets/svg/qrCode.svg';
import facebookIcon from 'assets/svg/facebook.svg';
import twitterIcon from 'assets/svg/twitter.svg';
import starIcon from 'assets/svg/star.svg';
import goldIcon from 'assets/svg/gold.svg';
import difficultyStarIcon from 'assets/svg/difficulty-star.svg';
import questDialogDrops from '../shops/quests/questDialogDrops';
import questDialogContent from '../shops/quests/questDialogContent';
import QuestInfo from '../shops/quests/questInfo';

export default {
  props: ['group'],
  components: {
    questDialogDrops,
    questDialogContent,
    QuestInfo,
  },
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
  mounted () {
    let questKeys = Object.keys(this.user.items.quests);
    this.selectedQuest = questKeys[0];

    this.$root.$on('selectQuest', this.selectQuest);
  },
  destroyed () {
    this.$root.$off('selectQuest', this.selectQuest);
  },
  computed: {
    ...mapState({user: 'user.data'}),
    questData () {
      return quests.quests[this.selectedQuest];
    },
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

      let groupId = this.group._id || this.user.party._id;

      const key = this.selectedQuest;
      const response = await this.$store.dispatch('guilds:inviteToQuest', {groupId, key});
      const quest = response.data.data;

      if (this.$store.state.party.data) this.$store.state.party.data.quest = quest;

      this.loading = false;

      this.$root.$emit('bv::hide::modal', 'start-quest-modal');
    },
  },
};
</script>
