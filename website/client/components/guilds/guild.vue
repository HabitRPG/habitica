<template lang="pug">
// TODO this is necessary until we have a way to wait for data to be loaded from the server
.row(v-if="guild")
  members-modal(:group='guild')

  .clearfix.col-8
    .row
      .col-6
        .float-left
          h2 {{guild.name}}
          strong.float-left {{$t('groupLeader')}}
          span.float-left : {{guild.leader.profile.name}}
      .col-6
        .float-right
          .row.icon-row
            .col-6
              img.icon.shield(src="~assets/guilds/gold-guild-badge.svg")
              | {{guild.memberCount}}
              div {{$t('members')}}
            .col-6
              .item-with-icon
                img.icon.gem(src="~assets/header/png/gem@3x.png")
              | {{guild.memberCount}}
              div {{$t('members')}}
    .row.chat-row
      .col-12
        h3(v-once) {{ $t('chat') }}

        textarea(placeholder='Type your message to Guild members here')
        button.btn.btn-secondary.send-chat.float-right Send

        div.hr
          div.hr-middle
            | Today

        .row
          .col-md-2
            img.icon(src="~assets/chat/like.svg")
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
                span.action
                  img.icon(src="~assets/chat/like.svg")
                  | Like
                span.action
                  img.icon(src="~assets/chat/copy.svg")
                  | Copy as To-Do
                span.action
                  img.icon(src="~assets/chat/report.svg")
                  | Report
                span.action
                  img.icon(src="~assets/chat/delete.svg")
                  | Delete
                span.action.float-right
                  img.icon(src="~assets/chat/liked.svg")
                  | +3

  .col-md-4.sidebar
    .guild-background.row
      .col-6
        p Image here
      .col-6
        button.btn.btn-primary Join Guild
        br
        button.btn.float-left(:class="[isMember ? 'btn-danger' : 'btn-success']") {{ isMember ? $t('leave') : $t('join') }}
        br
        button.btn.btn-purple Invite to Guild
        br
        button.btn.btn-purple Message Guild Leader
        br
        button.btn.btn-purple Donate Gems
    div
      h3(v-once) {{ $t('description') }}
      p {{ guild.description }}
      p Life hacks are tricks, shortcuts, or methods that help increase productivity, efficiency, health, and so on. Generally, they get you to a better state of life. Life hacking is the process of utilizing and implementing these secrets. And, in this guild, we want to help everyone discover these improved ways of doing things.
    div
      h3 Guild Information
      h4 Welcome
      p Below are some resources that some members might find useful. Consider checking them out before posting any questions, as they just might help answer some of them! Feel free to share your life hacks in the guild chat, or ask any questions that you might have. Please peruse at your leisure, and remember: this guild is meant to help guide you in the right direction. Only you will know what works best for you.
    div
      h3 Challenges
      .card
        h4 Challenge
        .row
          .col-8
            p Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla scelerisque ultrices libero.
          .col-4
        .row
          .col-md-12
            span Tag
            span 100
</template>

<style lang="scss" scoped>
  .sidebar {
    background-color: #edecee;
  }

  .card {
    margin: 2em 0;
    padding: 1em;

    h3.leader {
      color: #4f2a93;
    }

    .text {
      font-size: 16px;
      line-height: 1.43;
      color: #4e4a57;
    }
  }

  .guild-background {
    background-image: linear-gradient(to bottom, rgba(237, 236, 238, 0), #edecee);
    height: 300px;
  }

  textarea {
    height: 150px;
    width: 100%;
    border-radius: 2px;
    background-color: #ffffff;
    border: solid 1px #c3c0c7;
    font-size: 16px;
    font-style: italic;
    line-height: 1.43;
    color: #a5a1ac;
    padding: .5em;
  }

  .icon.shield, .icon.gem {
    width: 40px;
    margin-right: 1em;
  }

  .icon-row {
    margin-top: 1.5em;
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
    border-bottom: 1px solid #e1e0e3;
    text-align: center;
    margin: 2em 0;
  }

  .hr-middle {
    font-size: 16px;
    font-weight: bold;
    font-stretch: condensed;
    line-height: 1.5;
    text-align: center;
    color: #878190;
    background-color: #f9f9f9;
    padding: .2em;
    margin-top: .2em;
    display: inline-block;
    width: 100px;
  }

  span.action {
    font-size: 14px;
    line-height: 1.33;
    color: #878190;
    font-weight: 500;
    margin-right: 1em;
  }

  span.action .icon {
    margin-right: .3em;
  }
</style>

<script>
import axios from 'axios';
import groupUtilities from 'client/mixins/groupsUtilities';
import { mapState } from 'client/libs/store';
import membersModal from './membersModal';

export default {
  mixins: [groupUtilities],
  props: ['guildId'],
  components: {
    membersModal,
  },
  data () {
    return {
      guild: null,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
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
  },
  created () {
    this.fetchGuild();
  },
  watch: {
    // call again the method if the route changes (when this route is already active)
    $route: 'fetchGuild',
  },
  methods: {
    fetchGuild () {
      axios.get(`/api/v3/groups/${this.guildId}`).then(response => {
        this.guild = response.data.data;
        this.guild.chat = [
          {
            text: '@CharacterName Vestibulum ultricies, lorem non bibendum consequat, nisl lacus semper nulla, hendrerit dignissim ipsum erat eu odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla at aliquet urna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla non est ut nisl interdum tincidunt in eu dui. Proin condimentum a.',
          },
        ];
      });
    },
    editGroup () {
      // @TODO: Open up model
    },
    save () {
      let newLeader = this.group._newLeader && this.group._newLeader._id;

      if (newLeader) {
        this.group.leader = newLeader;
      }

      // Groups.Group.update(group);
    },
    deleteAllMessages () {
      if (confirm(window.env.t('confirmDeleteAllMessages'))) {
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
