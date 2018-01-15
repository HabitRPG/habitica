<template lang="pug">
.row(v-if="group._id")
  group-form-modal(v-if='isParty')
  invite-modal(:group='this.group')
  start-quest-modal(:group='this.group')
  quest-details-modal(:group='this.group')
  group-gems-modal
  .col-12.col-sm-8.standard-page
    .row
      .col-12.col-md-6.title-details
        h1 {{group.name}}
        strong.float-left(v-once) {{$t('groupLeader')}}
        span.leader.float-left(v-if='group.leader.profile', @click='showMemberProfile(group.leader)') : {{group.leader.profile.name}}
      .col-12.col-md-6
        .row.icon-row
          .col-4.offset-4(v-bind:class="{ 'offset-8': isParty }")
            .item-with-icon(@click="showMemberModal()")
              .svg-icon.shield(v-html="icons.goldGuildBadgeIcon", v-if='group.memberCount > 1000')
              .svg-icon.shield(v-html="icons.silverGuildBadgeIcon", v-if='group.memberCount > 100 && group.memberCount < 999')
              .svg-icon.shield(v-html="icons.bronzeGuildBadgeIcon", v-if='group.memberCount < 100')
              span.number {{ group.memberCount | abbrNum }}
              div(v-once) {{ $t('memberList') }}
          .col-4(v-if='!isParty')
            .item-with-icon(@click='showGroupGems()')
              .svg-icon.gem(v-html="icons.gem")
              span.number {{group.balance * 4}}
              div(v-once) {{ $t('guildBank') }}
    .row.chat-row
      .col-12
        h3(v-once) {{ $t('chat') }}
        .row.new-message-row
          textarea(:placeholder="!isParty ? $t('chatPlaceholder') : $t('partyChatPlaceholder')", v-model='newMessage', @keydown='updateCarretPosition', @keyup.ctrl.enter='sendMessage()')
          autocomplete(:text='newMessage', v-on:select="selectedAutocomplete", :coords='coords', :chat='group.chat')
        .row
          .col-6
            button.btn.btn-secondary.float-left.fetch(v-once, @click='fetchRecentMessages()') {{ $t('fetchRecentMessages') }}
            button.btn.btn-secondary.float-left(v-once, @click='reverseChat()') {{ $t('reverseChat') }}
          .col-6
            button.btn.btn-secondary.send-chat.float-right(v-once, @click='sendMessage()') {{ $t('send') }}
        .row.community-guidelines(v-if='!communityGuidelinesAccepted')
          div.col-8(v-once, v-html="$t('communityGuidelinesIntro')")
          div.col-4
            button.btn.btn-info(@click='acceptCommunityGuidelines()', v-once) {{ $t('acceptCommunityGuidelines') }}
        .row
          .col-12.hr
          chat-message(:chat.sync='group.chat', :group-id='group._id', group-name='group.name')
  .col-12.col-sm-4.sidebar
    .row(:class='{"guild-background": !isParty}')
      .col-6
      .col-6
        .button-container
          button.btn.btn-success(class='btn-success', v-if='isLeader && !group.purchased.active', @click='upgradeGroup()')
            | {{ $t('upgrade') }}
        .button-container
          button.btn.btn-primary(b-btn, @click="updateGuild", v-once, v-if='isLeader || isAdmin') {{ $t('edit') }}
        .button-container
          button.btn.btn-success(class='btn-success', v-if='!isMember', @click='join()') {{ $t('join') }}
        .button-container
          button.btn.btn-primary(v-once, @click='showInviteModal()') {{$t('invite')}}
          // @TODO: hide the invitation button if there's an active group plan and the player is not the leader
        .button-container
          // @TODO: V2 button.btn.btn-primary(v-once, v-if='!isLeader') {{$t('messageGuildLeader')}} // Suggest making the button visible to the leader too - useful for them to test how the feature works or to send a note to themself. -- Alys
        .button-container
          // @TODO: V2 button.btn.btn-primary(v-once, v-if='isMember && !isParty') {{$t('donateGems')}} // Suggest removing the isMember restriction - it's okay if non-members donate to a public guild. Also probably allow it for parties if parties can buy imagery. -- Alys
    .section-header(v-if='isParty')
      quest-sidebar-section(@toggle='toggleQuestSection', :show='sections.quest', :group='group')
    .section-header(v-if='!isParty')
      .row
        .col-10
          h3(v-once) {{ $t('guildSummary') }}
        .col-2
          .toggle-up(@click="sections.summary = !sections.summary", v-if="sections.summary")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.summary = !sections.summary", v-if="!sections.summary")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.summary")
        p(v-markdown='group.summary')
    .section-header
      .row
        .col-10
          h3 {{ $t('groupDescription') }}
        .col-2
          .toggle-up(@click="sections.description = !sections.description", v-if="sections.description")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.description = !sections.description", v-if="!sections.description")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.description")
        p(v-markdown='group.description')
    .section-header.challenge
      .row
        .col-10.information-header
          h3(v-once)
            | {{ $t('challenges') }}
          #groupPrivateDescOrChallengeInfo.icon.tooltip-wrapper(:title="isParty ? $t('challengeDetails') : $t('privateDescription')")
            .svg-icon(v-html='icons.information')
          b-tooltip(
            :title="isParty ? $t('challengeDetails') : $t('privateDescription')",
            target="groupPrivateDescOrChallengeInfo",
          )
        .col-2
          .toggle-up(@click="sections.challenges = !sections.challenges", v-if="sections.challenges")
            .svg-icon(v-html="icons.upIcon")
          .toggle-down(@click="sections.challenges = !sections.challenges", v-if="!sections.challenges")
            .svg-icon(v-html="icons.downIcon")
      .section(v-if="sections.challenges")
        group-challenges(:groupId='searchId')
    div.text-center
      button.btn.btn-danger(v-if='isMember', @click='clickLeave()') {{ $t('leave') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  @media (min-width: 1300px) {
    .standard-page {
      max-width: calc(100% - 430px);
    }

    .sidebar {
      max-width: 430px !important;
    }
  }

  h1 {
    color: $purple-200;
  }

  .leader:hover {
    cursor: pointer;
  }

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
    text-align: center;

    .svg-icon.shield, .svg-icon.gem {
      width: 28px;
      height: 28px;
      margin: 0 auto;
      display: inline-block;
      vertical-align: bottom;
      margin-right: 0.5em;
    }

    .number {
      font-size: 22px;
      font-weight: bold;
    }
  }

  .item-with-icon:hover {
    cursor: pointer;
  }

  .sidebar {
    background-color: $gray-600;
    padding-bottom: 2em;
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
    background-image: url('~assets/images/groups/grassy-meadow-backdrop.png');
    height: 246px;
  }

  textarea {
    height: 150px;
    width: 100%;
    background-color: $white;
    border: solid 1px $gray-400;
    font-size: 16px;
    line-height: 1.43;
    color: $gray-300;
    padding: .5em;
  }

  textarea::-webkit-input-placeholder { /* Chrome/Opera/Safari */
    font-style: italic;
  }
  textarea::-moz-placeholder { /* Firefox 19+ */
    font-style: italic;
  }
  textarea:-ms-input-placeholder { /* IE 10+ */
    font-style: italic;
  }
  textarea:-moz-placeholder { /* Firefox 18- */
    font-style: italic;
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

    .community-guidelines {
      background-color: rgba(135, 129, 144, 0.84);
      padding: 1em;
      color: $white;
      position: absolute;
      top: 0;
      height: 150px;
      padding-top: 3em;
      margin-top: 2.3em;
      width: 100%;
      border-radius: 4px;
    }

    .new-message-row {
      position: relative;
    }
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

  .information-header {
    h3, .tooltip-wrapper {
      display: inline-block;
    }

    .tooltip-wrapper {
      width: 15px;
      margin-left: 1.2em;
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

  .hr {
    width: 100%;
    height: 20px;
    border-bottom: 1px solid $gray-500;
    text-align: center;
    margin: 2em 0;
  }
</style>

<script>
// @TODO: Break this down into components

import debounce from 'lodash/debounce';
import extend from 'lodash/extend';
import groupUtilities from 'client/mixins/groupsUtilities';
import styleHelper from 'client/mixins/styleHelper';
import { mapState } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';
import membersModal from './membersModal';
import startQuestModal from './startQuestModal';
import questDetailsModal from './questDetailsModal';
import groupFormModal from './groupFormModal';
import inviteModal from './inviteModal';
import chatMessage from '../chat/chatMessages';
import autocomplete from '../chat/autoComplete';
import groupChallenges from '../challenges/groupChallenges';
import groupGemsModal from 'client/components/groups/groupGemsModal';
import questSidebarSection from 'client/components/groups/questSidebarSection';
import markdownDirective from 'client/directives/markdown';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';
import gemIcon from 'assets/svg/gem.svg';
import questIcon from 'assets/svg/quest.svg';
import informationIcon from 'assets/svg/information.svg';
import questBackground from 'assets/svg/quest-background-border.svg';
import upIcon from 'assets/svg/up.svg';
import downIcon from 'assets/svg/down.svg';
import goldGuildBadgeIcon from 'assets/svg/gold-guild-badge-small.svg';
import silverGuildBadgeIcon from 'assets/svg/silver-guild-badge-small.svg';
import bronzeGuildBadgeIcon from 'assets/svg/bronze-guild-badge-small.svg';

export default {
  mixins: [groupUtilities, styleHelper],
  props: ['groupId'],
  components: {
    membersModal,
    startQuestModal,
    groupFormModal,
    chatMessage,
    inviteModal,
    groupChallenges,
    autocomplete,
    questDetailsModal,
    groupGemsModal,
    questSidebarSection,
  },
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      searchId: '',
      group: {},
      icons: Object.freeze({
        like: likeIcon,
        copy: copyIcon,
        report: reportIcon,
        delete: deleteIcon,
        gem: gemIcon,
        liked: likedIcon,
        questIcon,
        information: informationIcon,
        questBackground,
        upIcon,
        downIcon,
        goldGuildBadgeIcon,
        silverGuildBadgeIcon,
        bronzeGuildBadgeIcon,
      }),
      selectedQuest: {},
      sections: {
        quest: true,
        summary: true,
        description: true,
        challenges: true,
      },
      newMessage: '',
      coords: {
        TOP: 0,
        LEFT: 0,
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    communityGuidelinesAccepted () {
      return this.user.flags.communityGuidelinesAccepted;
    },
    partyStore () {
      return this.$store.state.party;
    },
    isParty () {
      return this.$route.path.startsWith('/party');
    },
    isLeader () {
      return this.user._id === this.group.leader._id;
    },
    isAdmin () {
      return Boolean(this.user.contributor.admin);
    },
    isMember () {
      return this.isMemberOfGroup(this.user, this.group);
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
  },
  mounted () {
    if (!this.searchId) this.searchId = this.groupId;

    this.load();

    if (this.user.newMessages[this.searchId]) {
      this.$store.dispatch('chat:markChatSeen', {groupId: this.searchId});
      this.$delete(this.user.newMessages, this.searchId);
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.$set(this, 'searchId', to.params.groupId);

    // Reset chat
    this.newMessage = '';
    this.coords = {
      TOP: 0,
      LEFT: 0,
    };

    next();
  },
  watch: {
    // call again the method if the route changes (when this route is already active)
    $route: 'fetchGuild',
    partyStore () {
      if (this.$store.state.party._id) {
        this.group = this.$store.state.party;
      } else {
        this.group = null;
        this.$router.push('/');
      }
    },
  },
  methods: {
    acceptCommunityGuidelines () {
      this.$store.dispatch('user:set', {'flags.communityGuidelinesAccepted': true});
    },
    load () {
      if (this.isParty) {
        this.searchId = 'party';
        // @TODO: Set up from old client. Decide what we need and what we don't
        // Check Desktop notifs
        // Load invites
      }
      this.fetchGuild();

      this.$root.$on('updatedGroup', group => {
        let updatedGroup = extend(this.group, group);
        this.$set(this.group, updatedGroup);
      });
    },
    // @TODO: abstract autocomplete
    // https://medium.com/@_jh3y/how-to-where-s-the-caret-getting-the-xy-position-of-the-caret-a24ba372990a
    getCoord (e, text) {
      let carPos = text.selectionEnd;
      let div = document.createElement('div');
      let span = document.createElement('span');
      let copyStyle = getComputedStyle(text);

      [].forEach.call(copyStyle, (prop) => {
        div.style[prop] = copyStyle[prop];
      });

      div.style.position = 'absolute';
      document.body.appendChild(div);
      div.textContent = text.value.substr(0, carPos);
      span.textContent = text.value.substr(carPos) || '.';
      div.appendChild(span);
      this.coords = {
        TOP: span.offsetTop,
        LEFT: span.offsetLeft,
      };
      document.body.removeChild(div);
    },
    updateCarretPosition: debounce(function updateCarretPosition (eventUpdate) {
      this._updateCarretPosition(eventUpdate);
    }, 250),
    _updateCarretPosition (eventUpdate) {
      let text = eventUpdate.target;
      this.getCoord(eventUpdate, text);
    },
    selectedAutocomplete (newText) {
      this.newMessage = newText;
    },
    showMemberModal () {
      this.$store.state.memberModalOptions.groupId = this.group._id;
      this.$store.state.memberModalOptions.group = this.group;
      this.$root.$emit('bv::show::modal', 'members-modal');
    },
    async sendMessage () {
      if (!this.newMessage) return;

      let response = await this.$store.dispatch('chat:postChat', {
        group: this.group,
        message: this.newMessage,
      });
      this.group.chat.unshift(response.message);
      this.newMessage = '';
    },
    fetchRecentMessages () {
      this.fetchGuild();
    },
    reverseChat () {
      this.group.chat.reverse();
    },
    updateGuild () {
      this.$store.state.editingGroup = this.group;
      this.$root.$emit('bv::show::modal', 'guild-form');
    },
    showInviteModal () {
      this.$root.$emit('bv::show::modal', 'invite-modal');
    },
    async fetchGuild () {
      if (this.searchId === 'party' && !this.user.party._id) {
        this.$root.$emit('bv::show::modal', 'create-party-modal');
        return;
      }

      if (this.isParty) {
        await this.$store.dispatch('party:getParty', true);
        this.group = this.$store.state.party.data;
        this.checkForAchievements();
      } else {
        const group = await this.$store.dispatch('guilds:getGroup', {groupId: this.searchId});
        this.$set(this, 'group', group);
      }
    },
    deleteAllMessages () {
      if (confirm(this.$t('confirmDeleteAllMessages'))) {
        // User.clearPMs();
      }
    },
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
    async join () {
      if (this.group.cancelledPlan && !confirm(this.$t('aboutToJoinCancelledGroupPlan'))) {
        return;
      }
      await this.$store.dispatch('guilds:join', {guildId: this.group._id, type: 'myGuilds'});
      this.user.guilds.push(this.group._id);
    },
    clickLeave () {
      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Leave Party',
      });

      // @TODO: Get challenges and ask to keep or remove
      if (!confirm('Are you sure you want to leave?')) return;
      let keep = true;
      this.leave(keep);
    },
    async leave (keepTasks) {
      let keepChallenges = 'remain-in-challenges';

      let data = {
        groupId: this.group._id,
        keep: keepTasks,
        keepChallenges,
      };

      if (this.isParty) {
        data.type = 'party';
        Analytics.updateUser({partySize: null, partyID: null});
        this.$store.state.partyMembers = [];
      }

      await this.$store.dispatch('guilds:leave', data);

      if (this.isParty) {
        this.$router.push({name: 'tasks'});
      }
    },
    upgradeGroup () {
      this.$store.state.upgradingGroup = this.group;
      this.$router.push('/group-plans');
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
    clickStartQuest () {
      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Start a Quest',
      });

      let hasQuests = find(this.user.items.quests, (quest) => {
        return quest > 0;
      });

      if (hasQuests) {
        this.$root.$emit('bv::show::modal', 'start-quest-modal');
        return;
      }
      // $rootScope.$state.go('options.inventory.quests');
    },
    async showMemberProfile (leader) {
      let heroDetails = await this.$store.dispatch('members:fetchMember', { memberId: leader._id });
      this.$root.$emit('habitica:show-profile', {
        user: heroDetails.data.data,
        startingPage: 'profile',
      });
    },
    showGroupGems () {
      this.$root.$emit('bv::show::modal', 'group-gems-modal');
    },
    toggleQuestSection () {
      this.sections.quest = !this.sections.quest;
    },
  },
};
</script>
