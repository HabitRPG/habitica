<template lang="pug">
// TODO this is necessary until we have a way to wait for data to be loaded from the server
.row(v-if="group")
  .clearfix.col-8
    .row
      .col-6.title-details
        h1 {{group.name}}
        strong.float-left(v-once) {{$t('groupLeader')}}
        span.float-left(v-once, v-if='group.leader.profile') : {{group.leader.profile.name}}
      .col-6
        .row.icon-row
          .col-6
            members-modal(:group='group', v-if='isMember')
            .item-with-icon
              .svg-icon.shield(v-html="icons.goldGuildBadge")
              span.number {{group.memberCount}}
              div(v-once) {{ $t('guildMembers') }}
          .col-6
            .item-with-icon
              .svg-icon.gem(v-html="icons.gem")
              span.number {{group.memberCount}}
              div(v-once) {{ $t('guildBank') }}
    .row.chat-row
      .col-12
        h3(v-once) {{ $t('chat') }}

        textarea(:placeholder="$t('chatPlaceHolder')")
        button.btn.btn-secondary.send-chat.float-right(v-once) {{ $t('send') }}

        .hr
          .hr-middle(v-once) {{ $t('today') }}

        .row
          .col-md-2
            .svg-icon(v-html="icons.like")
          .col-md-10
            .card(v-for="msg in group.chat", :key="msg.id")
              .card-block
                h3.leader Character name
                span 2 hours ago
                .clearfix
                  strong.float-left {{msg.user}}
                  .float-right {{msg.timestamp}}
                .text {{msg.text}}
                hr
                span.action(v-once)
                  .svg-icon(v-html="icons.like")
                  | {{$t('like')}}
                span.action(v-once)
                  .svg-icon(v-html="icons.copy")
                  | {{$t('copyAsTodo')}}
                span.action(v-once)
                  .svg-icon(v-html="icons.report")
                  | {{$t('report')}}
                span.action(v-once)
                  .svg-icon(v-html="icons.delete")
                  | {{$t('delete')}}
                span.action.float-right
                  .svg-icon(v-html="icons.liked")
                  | +3

  .col-md-4.sidebar
    .guild-background.row
      .col-6
        p(v-if='!isParty')  Image here
      .col-6
        .button-container
          button.btn.btn-success(class='btn-success', v-if='isLeader') {{ $t('upgradeParty') }}
        .button-container
          button.btn.btn-primary(b-btn, @click="updateGuild", v-once, v-if='isLeader') {{ $t('updateGuild') }}
        .button-container
          button.btn.btn-success(class='btn-success', v-if='!isMember') {{ $t('join') }}
        .button-container
          button.btn.btn-primary(v-once) {{$t('inviteToGuild')}}
        .button-container
          button.btn.btn-primary(v-once, v-if='!isLeader') {{$t('messageGuildLeader')}}
        .button-container
          button.btn.btn-primary(v-once, v-if='isMember && !isParty') {{$t('donateGems')}}

    .section-header
      .row
        .col-10
          h3(v-once) {{ $t('questDetailsTitle') }}
        .col-2
          .toggle-up(@click="sections.quest = !sections.quest", v-if="sections.quest")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.quest = !sections.quest", v-if="!sections.quest")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.quest")
        .row.no-quest-section(v-if='isParty && !onPendingQuest && !onActiveQuest')
          .col-12.text-center
            .svg-icon(v-html="icons.questIcon")
            h4(v-once) {{ $t('yourNotOnQuest') }}
            p(v-once) {{ $t('questDescription') }}
            button.btn.btn-secondary(v-once, @click="openStartQuestModal()") {{ $t('startAQuest') }}
            start-quest-modal(:group='this.group')
        .row.quest-active-section(v-if='isParty && onPendingQuest && !onActiveQuest')
          h2 Pending quest
          button.btn.btn-secondary(v-once, @click="questForceStart()") {{ $t('begin') }}
          button.btn.btn-secondary(v-once, @click="questCancel()") {{ $t('cancel') }}
        .row.quest-active-section(v-if='isParty && !onPendingQuest && onActiveQuest')
          .col-12.text-center
            //- div(:class=`quest_${questData.key}`)
            h4(v-once) {{ questData.boss.name() }}
            div(style="width: 100%; background-color: red; height:50px;")
            .quest-box.svg-icon(v-html="icons.questBackground")
            .boss-info
              .row
                .col-6
                  h4.float-left Boss Name
                .col-6
                  span.float-right Participants
              .row
                .col-12.boss-health-bar
              .row.boss-details
                  .col-6
                    span.float-left 999/1000
                  .col-6
                    span.float-right 30 pending damage

    .section-header
      .row
        .col-10
          h3(v-once) {{ $t('description') }}
        .col-2
          .toggle-up(@click="sections.description = !sections.description", v-if="sections.description")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.description = !sections.description", v-if="!sections.description")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.description")
        p(v-once) {{ group.description }}
        p Life hacks are tricks, shortcuts, or methods that help increase productivity, efficiency, health, and so on. Generally, they get you to a better state of life. Life hacking is the process of utilizing and implementing these secrets. And, in this guild, we want to help everyone discover these improved ways of doing things.

    .section-header
      .row
        .col-10
          h3(v-once) {{ $t('guildInformation') }}
        .col-2
          .toggle-up(@click="sections.information = !sections.information", v-if="sections.information")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.information = !sections.information", v-if="!sections.information")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.information")
        h4 Welcome
        p Below are some resources that some members might find useful. Consider checking them out before posting any questions, as they just might help answer some of them! Feel free to share your life hacks in the guild chat, or ask any questions that you might have. Please peruse at your leisure, and remember: this guild is meant to help guide you in the right direction. Only you will know what works best for you.

    .section-header.challenge
      .row
        .col-10.information-header
          h3(v-once)
            | {{ $t('challenges') }}
          b-tooltip.icon.tooltip-wrapper(:content="$t('privateDescription')")
            .svg-icon(v-html='icons.information')
        .col-2
          .toggle-up(@click="sections.challenges = !sections.challenges", v-if="sections.challenges")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.challenges = !sections.challenges", v-if="!sections.challenges")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.challenges")
        .row.no-quest-section(v-if='!hasChallenges')
          .col-12.text-center
            .svg-icon(v-html="icons.challengeIcon")
            h4(v-once) {{ $t('haveNoChallenges') }}
            p(v-once) {{ $t('challengeDescription') }}
            button.btn.btn-secondary(v-once) {{ $t('createChallenge') }}
    div.text-center
      button.btn.btn-primary(class='btn-danger', v-if='isMember') {{ $t('leave') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .button-container {
    margin-bottom: 1em;

    button {
      width: 100%;
    }
  }

  .item-with-icon {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 1em;
  }

  .sidebar {
    background-color: $gray-600;
    padding-top: 2em;
  }

  .card {
    margin: 2em 0;
    padding: 1em;

    h3.leader {
      color: $purple-200;
    }

    .text {
      font-size: 16px;
      line-height: 1.43;
      color: $gray-50;
    }
  }

  .guild-background {
    background-image: linear-gradient(to bottom, rgba($gray-600, 0), $gray-600);
  }

  textarea {
    height: 150px;
    width: 100%;
    background-color: $white;
    border: solid 1px $gray-400;
    font-size: 16px;
    font-style: italic;
    line-height: 1.43;
    color: $gray-300;
    padding: .5em;
  }

  .svg-icon.shield, .svg-icon.gem {
    width: 40px;
    margin-right: 1em;
  }

  .title-details {
    padding-top: 1em;
    padding-left: 1em;
  }

  .icon-row {
    margin-top: 1em;

    .number {
      font-size: 22px;
      font-weight: bold;
    }
  }

  .chat-row {
    margin-top: 2em;

    .send-chat {
      margin-top: -3.5em;
      z-index: 10;
      position: relative;
      margin-right: 1em;
    }
  }

  .hr {
    width: 100%;
    height: 20px;
    border-bottom: 1px solid $gray-500;
    text-align: center;
    margin: 2em 0;
  }

  .hr-middle {
    font-size: 16px;
    font-weight: bold;
    font-family: 'Roboto Condensed';
    line-height: 1.5;
    text-align: center;
    color: $gray-200;
    background-color: $gray-700;
    padding: .2em;
    margin-top: .2em;
    display: inline-block;
    width: 100px;
  }

  span.action {
    font-size: 14px;
    line-height: 1.33;
    color: $gray-200;
    font-weight: 500;
    margin-right: 1em;
  }

  span.action .icon {
    margin-right: .3em;
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
      margin-bottom: 2em;
    }
  }

  .information-header {
    h3, .tooltip-wrapper {
      display: inline-block;
    }

    .tooltip-wrapper {
      margin-left: 2.2em;
    }
  }

  .quest-active-section {
    .quest-box {
      height: 200px;
      width: 100%;

      svg: {
        width: 100%;
        height: 100%;
      }
    }
  }

  .section-header {
    border-top: 1px solid #e1e0e3;
    margin-top: 1em;
    padding-top: 1em;
  }

  .section-header.challenge {
    border-bottom: 1px solid #e1e0e3;
    margin-bottom: 1em;
    padding-bottom: 1em;
  }

  .toggle-up, .toggle-down {
    cursor: pointer;
  }
</style>

<script>
import groupUtilities from 'client/mixins/groupsUtilities';
import { mapState } from 'client/libs/store';
import membersModal from './membersModal';
import startQuestModal from './startQuestModal';
import { TAVERN_ID } from 'common/script/constants';
import quests from 'common/script/content/quests';
import percent from 'common/script/libs/percent';

import bCollapse from 'bootstrap-vue/lib/components/collapse';
import bCard from 'bootstrap-vue/lib/components/card';
import bToggle from 'bootstrap-vue/lib/directives/toggle';
import bTooltip from 'bootstrap-vue/lib/components/tooltip';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';
import gemIcon from 'assets/svg/gem.svg';
import goldGuildBadgeIcon from 'assets/svg/gold-guild-badge.svg';
import questIcon from 'assets/svg/quest.svg';
import challengeIcon from 'assets/svg/challenge.svg';
import informationIcon from 'assets/svg/information.svg';
import questBackground from 'assets/svg/quest-background-border.svg';
import upIcon from 'assets/svg/up.svg';
import downIcon from 'assets/svg/down.svg';

export default {
  mixins: [groupUtilities],
  props: ['guildId'],
  components: {
    membersModal,
    startQuestModal,
    bCollapse,
    bCard,
    bTooltip,
  },
  directives: {
    bToggle,
  },
  data () {
    return {
      group: null,
      icons: Object.freeze({
        like: likeIcon,
        copy: copyIcon,
        report: reportIcon,
        delete: deleteIcon,
        gem: gemIcon,
        goldGuildBadge: goldGuildBadgeIcon,
        liked: likedIcon,
        questIcon,
        challengeIcon,
        information: informationIcon,
        questBackground,
        upIcon,
        downIcon,
      }),
      questData: {},
      selectedQuest: {},
      sections: {
        quest: true,
        description: true,
        information: true,
        challenges: true,
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isParty () {
      return this.$route.path.startsWith('/party');
    },
    onPendingQuest () {
      return Boolean(this.group.quest.key) && !this.group.quest.active;
    },
    onActiveQuest () {
      return this.group.quest.active;
    },
    isLeader () {
      return this.user._id === this.group.leader._id;
    },
    isMember () {
      return this.isMemberOfGroup(this.user, this.group);
    },
    canEditQuest () {
      let isQuestLeader = this.group.quest && this.group.quest.leader === this.user._id;
      return isQuestLeader;
    },
    isMemberOfPendingQuest () {
      let userid = this.user._id;
      let group = this.group;
      if (!group.quest || !group.quest.members) return false;
      if (group.quest.active) return false; // quest is started, not pending
      return userid in group.quest.members && group.quest.members[userid] !== false;
    },
    isMemberOfRunningQuest () {
      let userid = this.user._id;
      let group = this.group;
      if (!group.quest || !group.quest.members) return false;
      if (!group.quest.active) return false; // quest is pending, not started
      return group.quest.members[userid];
    },
    memberProfileName (memberId) {
      let foundMember = find(this.group.members, function findMember (member) {
        return member._id === memberId;
      });
      return foundMember.profile.name;
    },
    isManager (memberId, group) {
      return Boolean(group.managers[memberId]);
    },
    userCanApprove (userId, group) {
      if (!group) return false;
      let leader = group.leader._id === userId;
      let userIsManager = Boolean(group.managers[userId]);
      return leader || userIsManager;
    },
    hasChallenges () {
      if (!this.group.challenges) return false;
      return this.group.challenges.length === 0;
    },
    bossHpPercent () {
      return percent(this.group.quest.progress.hp, this.questData.boss.hp);
    }
  },
  created () {
    if (this.isParty) {
      this.groupId = 'party';
      // @TODO: Set up from old client. Decide what we need and what we don't
      // Check Desktop notifs
      // Mark Chat seen
      // Load members
      // Load invites
      // Load challenges
      // Load group tasks for group plan
      // Load approvals for group plan
    } else if (this.$route.path.startsWith('/guilds/tavern')) {
      this.groupId = TAVERN_ID;
    }
    this.fetchGuild();
  },
  watch: {
    // call again the method if the route changes (when this route is already active)
    $route: 'fetchGuild',
  },
  methods: {
    updateGuild () {
      this.$store.state.editingGroup = this.group;
      this.$root.$emit('show::modal', 'guild-form');
    },
    async fetchGuild () {
      let group = await this.$store.dispatch('guilds:getGroup', {groupId: this.groupId});
      if (this.isParty) {
        this.$store.party = group;
        this.group = this.$store.party;
        this.checkForAchievements();
        this.questData = quests.quests[this.group.quest.key];console.log(this.questData)
        return;
      }
      this.group = group;
    },
    deleteAllMessages () {
      if (confirm(this.$t('confirmDeleteAllMessages'))) {
        // User.clearPMs();
      }
    },
    openStartQuestModal () {
      this.$root.$emit('show::modal', 'start-quest-modal');
    },
    // inviteOrStartParty (group) {
      // Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Invite Friends'});

      // var sendInviteText = window.env.t('sendInvitations');
      // if (group.type !== 'party' && group.type !== 'guild') {
      //   $location.path("/options/groups/party");
      //   return console.log('Invalid group type.')
      // }
      //
      // if (group.purchased && group.purchased.plan && group.purchased.plan.customerId) sendInviteText += window.env.t('groupAdditionalUserCost');
      //
      // group.sendInviteText = sendInviteText;
      //
      // $rootScope.openModal('invite-' + group.type, {
      //   controller:'InviteToGroupCtrl',
      //   resolve: {
      //     injectedGroup: function() {
      //       return group;
      //     },
      //   },
      // });
    // },
    checkForAchievements () {
      // Checks if user's party has reached 2 players for the first time.
      if (!this.user.achievements.partyUp && this.group.memberCount >= 2) {
        // @TODO
        // User.set({'achievements.partyUp':true});
        // Achievement.displayAchievement('partyUp');
      }

      // Checks if user's party has reached 4 players for the first time.
      if (!this.user.achievements.partyOn && this.group.memberCount >= 4) {
        // @TODO
        // User.set({'achievements.partyOn':true});
        // Achievement.displayAchievement('partyOn');
      }
    },
    // @TODO: This should be moved to notifications component
    async join () {
      if (this.group.cancelledPlan && !confirm(this.$t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }

      await this.$store.dispatch('guilds:join', {groupId: this.group._id});

      // @TODO: Implement
      // User.sync();
      // Analytics.updateUser({'partyID': party.id});
      // $rootScope.hardRedirect('/#/options/groups/party');
    },
    clickLeave () {
      // Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Leave Party'});
      // @TODO: Get challenges and ask to keep or remove
      let keep = true;
      this.leave(keep);
    },
    async leave (keepTasks) {
      let keepChallenges = 'remain-in-challenges';
      await this.$store.dispatch('guilds:leave', {
        groupId: this.group._id,
        keep: keepTasks,
        keepChallenges,
      });

      // @TODO: Implement
      // Analytics.updateUser({'partySize':null,'partyID':null});
      // User.sync().then(function () {
      //  $rootScope.hardRedirect('/#/options/groups/party');
      // });
    },
    // @TODO: Move to notificatin component
    async leaveOldPartyAndJoinNewParty () {
      let newPartyName = 'where does this come from';
      if (!confirm(`Are you sure you want to delete your party and join${newPartyName}?`)) return;

      let keepChallenges = 'remain-in-challenges';
      await this.$store.dispatch('guilds:leave', {
        groupId: this.group._id,
        keep: false,
        keepChallenges,
      });

      await this.$store.dispatch('guilds:join', {groupId: this.group._id});
    },
    // @TODO: Move to notificatin component
    async reject () {
      await this.$store.dispatch('guilds:rejectInvite', {groupId: this.group._id});
      // User.sync();
    },
    clickStartQuest () {
      // Analytics.track({'hitType':'event','eventCategory':'button','eventAction':'click','eventLabel':'Start a Quest'});
      let hasQuests = find(this.user.items.quests, (quest) => {
        return quest > 0;
      });

      if (hasQuests) {
        this.$root.$emit('show::modal', 'owned-quests');
        return;
      }
      // $rootScope.$state.go('options.inventory.quests');
    },
    async questCancel () {
      if (!confirm(this.$t('sureCancel'))) return;
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/cancel'});
      this.group.quest = quest;
    },
    async questAbort () {
      if (!confirm(this.$t('sureAbort'))) return;
      if (!confirm(this.$t('doubleSureAbort'))) return;
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/abort'});
      this.group.quest = quest;
    },
    async questLeave () {
      if (!confirm(this.$t('sureLeave'))) return;
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/leave'});
      this.group.quest = quest;
    },
    async questAccept () {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/accept'});
      this.group.quest = quest;
    },
    async questForceStart () {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/force-start'});
      this.group.quest = quest;
    },
    // @TODO: Move to notificaitons component?
    async questReject () {
      let quest = await this.$store.dispatch('quests:sendAction', {groupId: this.group._id, action: 'quests/reject'});
      this.group.quest = quest;
    },
  },
};
</script>
