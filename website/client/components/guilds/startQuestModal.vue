<template lang="pug">
b-modal#start-quest-modal(title="Empty", size='sm', hide-footer=true)
  h2 Attack of the Mundane, Part 1: Dish Disaster!
  span by: Keith Holliday
  p You reach the shores of Washed-Up Lake for some well-earned relaxation... But the lake is polluted with unwashed dishes! How did this happen? Well, you simply cannot allow the lake to be in this state. There is only one thing you can do: clean the dishes and save your vacation spot! Better find some soap to clean up this mess. A lot of soap...
  div
    div
      Strong Collect: &nbsp;
      span 20 Bars of Soap
    div
      Strong Difficulty: &nbsp;
      span 20 Bars of Soap
  div
    button.btn.btn-primary(@click='questInit()') Invite Party to Quest
  div
    p Clicking “Invite” will send an invitation to your party members. When all members have accepted or denied, the Quest begins.

  .side-panel
    h4.text-center Rewards
    .box
      .svg-icon(v-html="icons.starIcon")
      strong 50 Experience
    .box
      .svg-icon(v-html="icons.goldIcon")
      strong 7 Gold
    h4.text-center Quest Owner Rewards
    .box
      .svg-icon(v-html="icons.goldIcon")
      strong Attack of the Mundane, Part 2: The SnackLess Monster
</template>

<style lang='scss'>
  @import '~client/assets/scss/colors.scss';

  header {
    background-color: $white;
    border: none !important;

    h5 {
      text-indent: -99999px;
    }
  }

  .side-panel {
    background: #edecee;
    position: absolute;
    height: 460px;
    width: 280px;
    top: -1.8em;
    left: 21em;
    z-index: -1;
    padding-top: 1em;
    border-radius: 4px;

    .box {
      width: 180px;
      height: 64px;
      border-radius: 2px;
      background-color: #ffffff;
      margin: 0 auto;
      margin-bottom: 1em;
      padding: 1.4em;
    }
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import copyIcon from 'assets/svg/copy.svg';
import greyBadgeIcon from 'assets/svg/grey-badge.svg';
import qrCodeIcon from 'assets/svg/qrCode.svg';
import facebookIcon from 'assets/svg/facebook.svg';
import twitterIcon from 'assets/svg/twitter.svg';
import starIcon from 'assets/svg/star.svg';
import goldIcon from 'assets/svg/gold.svg';

export default {
  props: ['groupId'],
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
      }),
      shareUserIdShown: false,
    };
  },
  methods: {
    async questInit () {
      // let key = this.selectedQuest.key;
      let key = 'dilatory';
      // Analytics.updateUser({'partyID': party._id, 'partySize': party.memberCount});
      await this.$store.dispatch('guilds:inviteToQuest', {groupId: this.groupId, key});
      this.selectedQuest = undefined;
    },
  },
};
</script>
