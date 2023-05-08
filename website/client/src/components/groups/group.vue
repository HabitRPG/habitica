<template>
  <div
    v-if="group._id"
    class="row"
  >
    <group-form-modal v-if="isParty" />
    <quest-detail-modal :group="group" />
    <participant-list-modal :group="group" />
    <invitation-list-modal :group="group" />
    <group-gems-modal />
    <div class="col-12 col-sm-8 standard-page">
      <div class="row">
        <div class="col-12 col-md-6 title-details">
          <h1>{{ group.name }}</h1>
          <div>
            <span class="mr-1 ml-0">
              <strong v-once>{{ $t('groupLeader') }}:</strong>
              <user-link
                class="mx-1"
                :user="group.leader"
              />
            </span>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="row icon-row">
            <div
              class="item-with-icon"
              tabindex="0"
              role="button"
              @keyup.enter="showMemberModal()"
              @click="showMemberModal()"
            >
              <div
                v-if="group.memberCount > 1000"
                class="svg-icon shield"
                v-html="icons.goldGuildBadgeIcon"
              ></div>
              <div
                v-if="group.memberCount > 100 && group.memberCount < 999"
                class="svg-icon shield"
                v-html="icons.silverGuildBadgeIcon"
              ></div>
              <div
                v-if="group.memberCount < 100"
                class="svg-icon shield"
                v-html="icons.bronzeGuildBadgeIcon"
              ></div>
              <span class="number">{{ group.memberCount | abbrNum }}</span>
              <div
                v-once
                class="member-list label"
              >
                {{ $t('memberList') }}
              </div>
            </div>
            <div v-if="!isParty">
              <div
                class="item-with-icon"
                tabindex="0"
                role="button"
                @keyup.enter="showGroupGems()"
                @click="showGroupGems()"
              >
                <div
                  class="svg-icon gem"
                  v-html="icons.gem"
                ></div>
                <span class="number">{{ group.balance * 4 }}</span>
                <div
                  v-once
                  class="label"
                >
                  {{ $t('guildBank') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <chat
        :label="$t('chat')"
        :group="group"
        :placeholder="!isParty ? $t('chatPlaceholder') : $t('partyChatPlaceholder')"
        @fetchRecentMessages="fetchRecentMessages()"
      >
        <template slot="additionRow">
          <div
            v-if="showNoNotificationsMessage"
            class="row"
          >
            <div class="col-12 no-notifications">
              {{ $t('groupNoNotifications') }}
            </div>
          </div>
        </template>
      </chat>
    </div>
    <right-sidebar
      :is-admin="isAdmin"
      :is-leader="isLeader"
      :is-member="isMember"
      :is-party="isParty"
      :group="group"
      :search-id="searchId"
      class="col-12 col-sm-4"
      @leave="clickLeave()"
      @join="join()"
      @messageLeader="messageLeader()"
      @upgradeGroup="upgradeGroup"
      @updateGuild="updateGuild"
      @showInviteModal="showInviteModal()"
    />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  @media (min-width: 1300px) {
    .standard-page {
      max-width: calc(100% - 430px);
    }
  }

  h1 {
    color: $purple-200;
  }

  .item-with-icon {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 1em;
    text-align: center;
    min-width: 120px;
    height: 76px;
    margin-right: 1rem;

    &:last-of-type {
      margin-left: 0.5rem;
    }

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

  .buttons-wrapper {
    padding: 2.8em 24px 0em 24px;
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
    justify-content: flex-end;

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
import groupUtilities from '@/mixins/groupsUtilities';
import styleHelper from '@/mixins/styleHelper';
import { mapGetters } from '@/libs/store';
import * as Analytics from '@/libs/analytics';
import participantListModal from './participantListModal';
import groupFormModal from './groupFormModal';
import groupGemsModal from '@/components/groups/groupGemsModal';
import markdownDirective from '@/directives/markdown';
import chat from './chat';
import userLink from '../userLink';

import deleteIcon from '@/assets/svg/delete.svg';
import copyIcon from '@/assets/svg/copy.svg';
import likeIcon from '@/assets/svg/like.svg';
import likedIcon from '@/assets/svg/liked.svg';
import reportIcon from '@/assets/svg/report.svg';
import gemIcon from '@/assets/svg/gem.svg';
import questIcon from '@/assets/svg/quest.svg';
import questBackground from '@/assets/svg/quest-background-border.svg';
import goldGuildBadgeIcon from '@/assets/svg/gold-guild-badge-small.svg';
import silverGuildBadgeIcon from '@/assets/svg/silver-guild-badge-small.svg';
import bronzeGuildBadgeIcon from '@/assets/svg/bronze-guild-badge-small.svg';
import QuestDetailModal from './questDetailModal';
import RightSidebar from '@/components/groups/rightSidebar';
import InvitationListModal from './invitationListModal';
import { PAGES } from '@/libs/consts';
import { userStateMixin } from '../../mixins/userState';

export default {
  components: {
    InvitationListModal,
    QuestDetailModal,
    RightSidebar,
    groupFormModal,
    participantListModal,
    groupGemsModal,
    userLink,
    chat,
  },
  directives: {
    markdown: markdownDirective,
  },
  mixins: [groupUtilities, styleHelper, userStateMixin],
  props: ['groupId'],
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
      membersLoaded: false,
      selectedQuest: {},
      chat: {
        submitDisable: false,
        submitTimeout: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      partyMembers: 'party:members',
    }),
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
      return Boolean(this.hasPermission(this.user, 'moderator'));
    },
    isMember () {
      return this.isMemberOfGroup(this.user, this.group);
    },
    showNoNotificationsMessage () {
      return this.group.memberCount > this.$store.state.constants.LARGE_GROUP_COUNT_MESSAGE_CUTOFF;
    },
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
  async mounted () {
    if (this.isParty) this.searchId = 'party';
    if (!this.searchId) this.searchId = this.groupId;
    await this.fetchGuild();

    const type = this.isParty ? 'party' : 'guilds';
    this.$store.dispatch('common:setTitle', {
      section: this.$route.path.startsWith('/group-plans') ? this.$t('groupPlans') : this.$t(type),
      subSection: this.group.name,
    });
    this.$root.$on('updatedGroup', this.onGroupUpdate);
  },
  beforeDestroy () {
    this.$root.$off('updatedGroup', this.onGroupUpdate);
  },
  beforeRouteUpdate (to, from, next) {
    this.$set(this, 'searchId', to.params.groupId);
    next();
  },
  methods: {
    acceptCommunityGuidelines () {
      this.$store.dispatch('user:set', { 'flags.communityGuidelinesAccepted': true });
    },
    onGroupUpdate (group) {
      const updatedGroup = extend(this.group, group);
      this.$set(this.group, updatedGroup);
      const type = this.isParty ? 'party' : 'guilds';
      this.$store.dispatch('common:setTitle', {
        section: this.$route.path.startsWith('/group-plans') ? this.$t('groupPlans') : this.$t(type),
        subSection: group.name,
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
      this.$store.state.memberModalOptions.loading = true;

      if (this.isParty) {
        this.membersLoaded = true;
        this.members = this.partyMembers;
        this.$store.state.memberModalOptions.loading = false;
      } else if (!this.membersLoaded) {
        this.membersLoaded = true;

        this.loadMembers({
          groupId: this.group._id,
          includeAllPublicFields: true,
        }).then(m => {
          this.members.push(...m);
          this.$store.state.memberModalOptions.loading = false;
        });
      } else {
        this.$store.state.memberModalOptions.loading = false;
      }

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
        this.$store.dispatch('common:setTitle', {
          section: this.$route.path.startsWith('/group-plans') ? this.$t('groupPlans') : this.$t('party'),
          subSection: this.group.name,
        });
      } else {
        const group = await this.$store.dispatch('guilds:getGroup', { groupId: this.searchId });
        this.$set(this, 'group', group);
        this.$store.dispatch('common:setTitle', {
          section: this.$route.path.startsWith('/group-plans') ? this.$t('groupPlans') : this.$t('guilds'),
          subSection: group.name,
        });
      }

      const groupId = this.searchId === 'party' ? this.user.party._id : this.searchId;
      if (this.hasUnreadMessages(groupId)) {
        const notification = this.user
          .notifications.find(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupId);
        const notificationId = notification && notification.id;
        this.$store.dispatch('chat:markChatSeen', { groupId, notificationId });
      }
    },
    // returns the notification id or false
    hasUnreadMessages (groupId) {
      if (this.user.newMessages[groupId]) return true;

      return this.user.notifications.some(n => n.type === 'NEW_CHAT_MESSAGE' && n.data.group.id === groupId);
    },
    async join () {
      if (this.group.cancelledPlan && !window.confirm(this.$t('aboutToJoinCancelledGroupPlan'))) { // eslint-disable-line no-alert
        return;
      }
      await this.$store.dispatch('guilds:join', { groupId: this.group._id, type: 'guild' });
    },
    clickLeave () {
      // @TODO: Get challenges and ask to keep or remove
      if (!window.confirm('Are you sure you want to leave?')) return; // eslint-disable-line no-alert
      const keep = true;
      this.leave(keep);
    },
    async leave (keepTasks) {
      const keepChallenges = 'remain-in-challenges';

      const data = {
        groupId: this.group._id,
        keep: keepTasks,
        keepChallenges,
      };

      if (this.isParty) {
        data.type = 'party';
        Analytics.updateUser({ partySize: null, partyID: null });
        this.$store.state.partyMembers = [];
      }

      await this.$store.dispatch('guilds:leave', data);

      if (this.isParty) {
        await this.$router.push({ name: 'tasks' });
        window.location.reload(true);
      }
    },
    upgradeGroup () {
      this.$store.state.upgradingGroup = this.group;
      this.$router.push('/group-plans');
    },
    showGroupGems () {
      this.$root.$emit('bv::show::modal', 'group-gems-modal');
    },
    messageLeader () {
      window.open(`${PAGES.PRIVATE_MESSAGES}?uuid=${this.group.leader.id}`);
    },
  },
};
</script>
