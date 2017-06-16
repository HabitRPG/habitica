<template lang="pug">
// TODO this is necessary until we have a way to wait for data to be loaded from the server
.row(v-if="guild")
  .clearfix.col-8
    .row
      .col-6.title-details
        h1 {{guild.name}}
        strong.float-left(v-once) {{$t('groupLeader')}}
        span.float-left(v-once, v-if='guild.leader.profile') : {{guild.leader.profile.name}}
      .col-6
        .row.icon-row
          .col-6
            members-modal(:group='guild', v-if='isMember')
            .item-with-icon
              .svg-icon.shield(v-html="icons.goldGuildBadge")
              span.number {{guild.memberCount}}
              div(v-once) {{ $t('guildMembers') }}
          .col-6
            .item-with-icon
              .svg-icon.gem(v-html="icons.gem")
              span.number {{guild.memberCount}}
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
            .card(v-for="msg in guild.chat", :key="msg.id")
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
        .col-8
          h3(v-once) {{ $t('questDetailsTitle') }}
        .col-4
          .toggle-up(@click="sections.quest = !sections.quest", v-if="sections.quest")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.quest = !sections.quest", v-if="!sections.quest")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.quest")
        .row.no-quest-section(v-if='isParty && !onQuest')
          .col-12.text-center
            .svg-icon(v-html="icons.questIcon")
            h4(v-once) {{ $t('yourNotOnQuest') }}
            p(v-once) {{ $t('questDescription') }}
            button.btn.btn-secondary(v-once) {{ $t('startAQuest') }}
        .row.quest-active-section
          .col-12.text-center
            .svg-icon(v-html="icons.questIcon")
            p {{questData}}
            h4(v-once) {{ $t('yourNotOnQuest') }}
            p(v-once) {{ $t('questDescription') }}
            <!-- .quest-box(style='background-image: {{this.questBackground}}') -->
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
        .col-8
          h3(v-once) {{ $t('description') }}
        .col-4
          button(@click="sections.description = !sections.description") Toggle
      .section(v-if="sections.description")
        p(v-once) {{ guild.description }}
        p Life hacks are tricks, shortcuts, or methods that help increase productivity, efficiency, health, and so on. Generally, they get you to a better state of life. Life hacking is the process of utilizing and implementing these secrets. And, in this guild, we want to help everyone discover these improved ways of doing things.

    .section-header
      .row
        .col-8
          h3(v-once) {{ $t('guildInformation') }}
        .col-4
          button(@click="sections.information = !sections.information") Toggle
      .section(v-if="sections.information")
        h4 Welcome
        p Below are some resources that some members might find useful. Consider checking them out before posting any questions, as they just might help answer some of them! Feel free to share your life hacks in the guild chat, or ask any questions that you might have. Please peruse at your leisure, and remember: this guild is meant to help guide you in the right direction. Only you will know what works best for you.

    .section-header.challenge
      .row
        .col-8.information-header
          h3(v-once)
            | {{ $t('challenges') }}
          b-tooltip.icon.tooltip-wrapper(:content="$t('privateDescription')")
            .svg-icon(v-html='icons.information')
        .col-4
          button(@click="sections.challenges = !sections.challenges") Toggle
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
</style>

<script>
import groupUtilities from 'client/mixins/groupsUtilities';
import { mapState } from 'client/libs/store';
import membersModal from './membersModal';
import { TAVERN_ID } from 'common/script/constants';
import quests from 'common/script/content/quests';

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
    bCollapse,
    bCard,
    bTooltip,
  },
  directives: {
    bToggle,
  },
  data () {
    return {
      guild: null,
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
    onQuest () {
      let fakeQuestData = {
        active: true,
        extra: {},
        key: "basilist",
        leader: "206039c6-24e4-4b9f-8a31-61cbb9aa3f66",
        members: {},
        progress: {hp: 100, collect: {}},
      };
      this.guild.quest = fakeQuestData;
      console.log(quests);
      this.questData = quests.quests[this.guild.quest.key];
      return this.guild.quest.active;
    },
    isLeader () {
      return this.user._id === this.guild.leader._id;
    },
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
    isMemberOfPendingQuest () {
      let userid = this.user._id;
      let group = this.guild;
      if (!group.quest || !group.quest.members) return false;
      if (group.quest.active) return false; // quest is started, not pending
      return userid in group.quest.members && group.quest.members[userid] !== false;
    },
    isMemberOfRunningQuest () {
      let userid = this.user._id;
      let group = this.guild;
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
      if (!this.guild.challenges) return false;
      return this.guild.challenges.length === 0;
    },
  },
  created () {
    if (this.isParty) {
      this.guildId = 'party';
    } else if (this.$route.path.startsWith('/guilds/tavern')) {
      this.guildId = TAVERN_ID;
    }
    this.fetchGuild();
  },
  watch: {
    // call again the method if the route changes (when this route is already active)
    $route: 'fetchGuild',
  },
  methods: {
    updateGuild () {
      this.$store.state.editingGroup = this.guild;
      this.$root.$emit('show::modal', 'guild-form');
    },
    async fetchGuild () {
      this.guild = await this.$store.dispatch('guilds:getGroup', {groupId: this.guildId});
    },
    deleteAllMessages () {
      if (confirm(this.$t('confirmDeleteAllMessages'))) {
        // User.clearPMs();
      }
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
  },
};
</script>
