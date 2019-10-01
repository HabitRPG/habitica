<template lang="pug">
  b-modal#quest-details(title="Empty", size='md', :hide-footer="true", :hide-header="true")
    .left-panel.content
      h3.text-center {{ $t('participantsTitle') }}
      .row
        .col-10.offset-1.text-center
          span.description(v-once) {{ $t('participantDesc') }}
      .row
        .col-12.member(v-for='member in members')
          strong(:class="{'declined-name': member.accepted === false}") {{member.name}}
          .accepted.float-right(v-if='member.accepted === true') {{ $t('accepted') }}
          .declined.float-right(v-if='member.accepted === false') {{ $t('declined') }}
          .pending.float-right(v-if='member.accepted === null') {{ $t('pending') }}
    div(v-if='questData')
      questDialogContent(:item="questData")
    div.text-center.actions(v-if='canEditQuest')
      div
        button.btn.btn-secondary(v-once, @click="questConfirm()") {{ $t('begin') }}
        // @TODO don't allow the party leader to start the quest until the leader has accepted or rejected the invitation (users get confused and think "begin" means "join quest")
      div
        .cancel(v-once, @click="questCancel()") {{ $t('cancel') }}
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
    left: -22.8em;
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

  .member {
    padding: 1em .5em;
    border-top: 1px solid #686274;

    .declined-name {
      color: #878190;
    }

    .accepted {
      color: #1ed3a0;
    }

    .declined {
      color: #f19595;
    }

    .pending {
      color: #c3c0c7;
    }
  }

  .actions {
    padding-top: 2em;
    padding-bottom: 2em;

    .cancel {
      color: #f74e52;
      margin-top: 3em;
    }

    .cancel:hover {
      cursor: pointer;
    }
  }
</style>

<script>
import { mapState, mapGetters } from 'client/libs/store';
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

export default {
  props: ['group'],
  components: {
    questDialogDrops,
    questDialogContent,
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
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    ...mapGetters({
      partyMembers: 'party:members',
    }),
    questData () {
      return quests.quests[this.group.quest.key];
    },
    members () {
      let partyMembers = this.partyMembers || [];
      return partyMembers.map(member => {
        return {
          name: member.profile.name,
          accepted: this.group.quest.members[member._id],
        };
      });
    },
    canEditQuest () {
      if (!this.group.quest) return false;
      let isQuestLeader = this.group.quest.leader === this.user._id;
      let isPartyLeader = this.group.leader._id === this.user._id;
      return isQuestLeader || isPartyLeader;
    },
  },
  methods: {
    async questConfirm () {
      let count = 0;
      for (let uuid in this.group.quest.members) {
        if (this.group.quest.members[uuid]) count += 1;
      }
      if (!confirm(this.$t('questConfirm', { questmembers: count, totalmembers: this.group.memberCount}))) return;
      this.questForceStart();
    },
    async questForceStart () {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/force-start'});
      this.group.quest = quest;
      this.close();
    },
    async questCancel () {
      if (!confirm(this.$t('sureCancel'))) return;
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/cancel'});
      this.group.quest = quest;
      this.close();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'quest-details');
    },
  },
};
</script>
