<template lang="pug">
.row(v-if="group._id")
  group-form-modal(v-if='isParty')
  start-quest-modal(:group='this.group')
  quest-details-modal(:group='this.group')
  participant-list-modal(:group='this.group')
  group-gems-modal
  .col-12.col-sm-8.standard-page
    .row
      .col-12.col-md-6.title-details
        h1 {{group.name}}
        div
          span.mr-1.ml-0
            strong(v-once) {{$t('groupLeader')}}:
            user-link.mx-1(:user="group.leader")
      .col-12.col-md-6
        .row.icon-row
          .col-4.offset-4(v-bind:class="{ 'offset-8': isParty }")
            .item-with-icon(@click="showMemberModal()")
              .svg-icon.shield(v-html="icons.goldGuildBadgeIcon", v-if='group.memberCount > 1000')
              .svg-icon.shield(v-html="icons.silverGuildBadgeIcon", v-if='group.memberCount > 100 && group.memberCount < 999')
              .svg-icon.shield(v-html="icons.bronzeGuildBadgeIcon", v-if='group.memberCount < 100')
              span.number {{ group.memberCount | abbrNum }}
              div.member-list.label(v-once) {{ $t('memberList') }}
          .col-4(v-if='!isParty')
            .item-with-icon(@click='showGroupGems()')
              .svg-icon.gem(v-html="icons.gem")
              span.number {{group.balance * 4}}
              div.label(v-once) {{ $t('guildBank') }}
    chat(
      :label="$t('chat')",
      :group="group",
      :placeholder="!isParty ? $t('chatPlaceholder') : $t('partyChatPlaceholder')",
      @fetchRecentMessages="fetchRecentMessages()"
    )
      template(slot="additionRow")
        .row(v-if='showNoNotificationsMessage')
          .col-12.no-notifications
            | {{$t('groupNoNotifications')}}
  .col-12.col-sm-4.sidebar
    .row(:class='{"guild-background": !isParty}')
      .col-12.buttons-wrapper
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
    div
      quest-sidebar-section(:group='group', v-if='isParty')
      sidebar-section(:title="$t('guildSummary')", v-if='!isParty')
        p(v-markdown='group.summary')
      sidebar-section(:title="$t('groupDescription')")
        p(v-markdown='group.description')
      sidebar-section(
        :title="$t('challenges')",
        :tooltip="$t('challengeDetails')"
      )
        group-challenges(:groupId='searchId')
    div.text-center
      button.btn.btn-danger(v-if='isMember', @click='clickLeave()') {{ isParty ? $t('leaveParty') : $t('leaveGroup') }}
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
    min-width: 80px;
    max-width: 120px;
    height: 76px;

    .svg-icon.shield, .svg-icon.gem {
      width: 28px;
      height: auto;
      margin: 0 auto;
      display: inline-block;
      vertical-align: bottom;
      margin-right: 0.5em;
    }

    .number {
      font-size: 22px;
      font-weight: bold;
    }

    .label {
      margin-top: .5em;
    }
  }

  .item-with-icon:hover {
    cursor: pointer;
  }

  .sidebar {
    background-color: $gray-600;
    padding-bottom: 2em;

  }

  .buttons-wrapper {
    padding-top: 2.8em;
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

    .new-message-row {
      position: relative;
    }

    .chat-actions {
      margin-top: 1em;

      .chat-receive-actions {
        padding-left: 0;

        button {
          margin-bottom: 1em;

          &:not(:last-child) {
            margin-right: 1em;
          }
        }
      }

      .chat-send-actions {
        padding-right: 0;
      }
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

  .hr {
    width: 100%;
    height: 20px;
    border-bottom: 1px solid $gray-500;
    text-align: center;
    margin: 2em 0;
  }

  .no-notifications {
    border-radius: 4px;
    border: solid 1px $orange-10;
    padding: 1em;
    margin-top: 3em;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: $orange-50;
  }
</style>

<script>
// @TODO: Break this down into components

import extend from 'lodash/extend';
import groupUtilities from 'client/mixins/groupsUtilities';
import styleHelper from 'client/mixins/styleHelper';
import { mapState } from 'client/libs/store';
import * as Analytics from 'client/libs/analytics';
import membersModal from './membersModal';
import startQuestModal from './startQuestModal';
import questDetailsModal from './questDetailsModal';
import participantListModal from './participantListModal';
import groupFormModal from './groupFormModal';
import groupChallenges from '../challenges/groupChallenges';
import groupGemsModal from 'client/components/groups/groupGemsModal';
import questSidebarSection from 'client/components/groups/questSidebarSection';
import markdownDirective from 'client/directives/markdown';
import chat from './chat';
import sidebarSection from '../sidebarSection';
import userLink from '../userLink';

import deleteIcon from 'assets/svg/delete.svg';
import copyIcon from 'assets/svg/copy.svg';
import likeIcon from 'assets/svg/like.svg';
import likedIcon from 'assets/svg/liked.svg';
import reportIcon from 'assets/svg/report.svg';
import gemIcon from 'assets/svg/gem.svg';
import questIcon from 'assets/svg/quest.svg';
import questBackground from 'assets/svg/quest-background-border.svg';
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
    groupChallenges,
    questDetailsModal,
    participantListModal,
    groupGemsModal,
    questSidebarSection,
    sidebarSection,
    userLink,
    chat,
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
        questBackground,
        goldGuildBadgeIcon,
        silverGuildBadgeIcon,
        bronzeGuildBadgeIcon,
      }),
      members: [],
      selectedQuest: {},
      chat: {
        submitDisable: false,
        submitTimeout: null,
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
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
    showNoNotificationsMessage () {
      return this.group.memberCount > this.$store.state.constants.LARGE_GROUP_COUNT_MESSAGE_CUTOFF;
    },
  },
  mounted () {
    if (this.isParty) this.searchId = 'party';
    if (!this.searchId) this.searchId = this.groupId;
    this.load();
  },
  beforeRouteUpdate (to, from, next) {
    this.$set(this, 'searchId', to.params.groupId);

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
    async load () {
      if (this.isParty) {
        this.searchId = 'party';
        // @TODO: Set up from old client. Decide what we need and what we don't
        // Check Desktop notifs
        // Load invites
      }
      await this.fetchGuild();
      // Fetch group members on load
      this.members = await this.loadMembers({
        groupId: this.group._id,
        includeAllPublicFields: true,
      });
      this.$root.$on('updatedGroup', group => {
        let updatedGroup = extend(this.group, group);
        this.$set(this.group, updatedGroup);
      });
    },

    /**
     * Method for loading members of a group, with optional parameters for
     * modifying requests.
     *
     * @param {Object}  payload     Used for modifying requests for members
     */
    loadMembers (payload = null) {
      // Remove unnecessary data
      if (payload && payload.challengeId) {
        delete payload.challengeId;
      }

      return this.$store.dispatch('members:getGroupMembers', payload);
    },
    showMemberModal () {
      this.$root.$emit('habitica:show-member-modal', {
        groupId: this.group._id,
        group: this.group,
        memberCount: this.group.memberCount,
        viewingMembers: this.members,
        fetchMoreMembers: this.loadMembers,
      });
    },
    fetchRecentMessages () {
      this.fetchGuild();
    },
    updateGuild () {
      this.$store.state.editingGroup = this.group;
      this.$root.$emit('bv::show::modal', 'guild-form');
    },
    showInviteModal () {
      this.$root.$emit('inviteModal::inviteToGroup', this.group); // This event listener is initiated in ../header/index.vue
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

      const groupId = this.searchId === 'party' ? this.user.party._id : this.searchId;
      if (this.hasUnreadMessages(groupId)) {
        // Delay by 1sec to make sure it returns after other requests that don't have the notification marked as read
        setTimeout(() => {
          this.$store.dispatch('chat:markChatSeen', {groupId});
          this.$delete(this.user.newMessages, groupId);
        }, 1000);
      }
    },
    hasUnreadMessages (groupId) {
      if (this.user.newMessages[groupId]) return true;

      return this.user.notifications.some(n => {
        return n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupId;
      });
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
      await this.$store.dispatch('guilds:join', {groupId: this.group._id, type: 'guild'});
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
    showGroupGems () {
      this.$root.$emit('bv::show::modal', 'group-gems-modal');
    },
  },
};
</script>
