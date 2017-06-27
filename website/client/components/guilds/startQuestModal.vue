<template lang="pug">
  b-modal#start-quest-modal(title="Empty", size='md', hide-footer=true, v-if='questData')
    .quest-image(:class="'quest_' + questData.key")
    h2 {{questData.text()}}
    //- span by: Keith Holliday @TODO: Add author
    p {{questData.notes()}}
    div.quest-details
      div(v-if=' questData.collect')
        Strong {{$t('collect')}}: &nbsp;
        span(v-for="(value, key, index) in questData.collect")
          | {{$t('collectionItems', { number: questData.collect[key].count, items: questData.collect[key].text() })}}
      div
        Strong {{$t('collect')}}: &nbsp;
        span
          .svg-icon(v-html="icons.difficultyStarIcon")
    div
      button.btn.btn-primary(@click='questInit()') {{$t('inviteToPartyOrQuest')}}
    div
      p {{$t('inviteInformation')}}
    .side-panel
      h4.text-center {{$t('rewards')}}
      .box
        .svg-icon.rewards-icon(v-html="icons.starIcon")
        strong {{questData.drop.exp}} {{$t('experience')}}
      .box
        .svg-icon.rewards-icon(v-html="icons.goldIcon")
        strong {{questData.drop.gp}} {{$t('gold')}}
      h4.text-center(v-if='questData.drop.items') {{$t('questOwnerRewards')}}
      .box(v-for='item in questData.drop.items')
        .rewards-icon(v-if='item.type === "quest"', :class="'quest_' + item.key")
        .drop-rewards-icon(v-if='item.type === "gear"', :class="'shop_' + item.key")
        strong.quest-reward-text {{item.text()}}
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

  .quest-image {
    margin: 0 auto;
    margin-bottom: 1em;
  }

  .quest-details {
    margin: 0 auto;
    text-align: left;
    width: 180px;
  }

  .btn-primary {
    margin: 1em 0;
  }

  .side-panel {
    background: #edecee;
    position: absolute;
    height: 460px;
    width: 320px;
    top: -1.8em;
    left: 35em;
    z-index: -1;
    padding-top: 1em;
    border-radius: 4px;

    .drop-rewards-icon {
      width: 35px;
      height: 35px;
      float: left;
    }

    .rewards-icon {
      float: left;
      width: 30px;
      height: 30px;

      svg {
        width: 30px;
        height: 30px;
      }
    }

    .quest-reward-text {
      font-size: 12px;
    }

    .box {
      width: 220px;
      height: 64px;
      border-radius: 2px;
      background-color: #ffffff;
      margin: 0 auto;
      margin-bottom: 1em;
      padding: 1em;
    }
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import quests from 'common/script/content/quests';

import copyIcon from 'assets/svg/copy.svg';
import greyBadgeIcon from 'assets/svg/grey-badge.svg';
import qrCodeIcon from 'assets/svg/qrCode.svg';
import facebookIcon from 'assets/svg/facebook.svg';
import twitterIcon from 'assets/svg/twitter.svg';
import starIcon from 'assets/svg/star.svg';
import goldIcon from 'assets/svg/gold.svg';
import difficultyStarIcon from 'assets/svg/difficulty-star.svg';

export default {
  props: ['group', 'selectedQuest'],
  components: {
    bModal,
  },
  data () {
    return {
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
    };
  },
  computed: {
    questData () {
      return quests.quests[this.selectedQuest];
    },
  },
  methods: {
    async questInit () {
      let key = this.selectedQuest;
      // Analytics.updateUser({'partyID': party._id, 'partySize': party.memberCount});
      let response = await this.$store.dispatch('guilds:inviteToQuest', {groupId: this.group._id, key});
      let quest = response.data.data;
      this.$store.party.quest = quest;
      this.$root.$emit('hide::modal', 'start-quest-modal');
    },
  },
};
</script>
