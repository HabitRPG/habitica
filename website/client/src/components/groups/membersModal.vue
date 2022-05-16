<template>
  <!-- @TODO: Move this to a member directory-->
  <div>
    <remove-member-modal
      :member-to-remove="memberToRemove"
      :group-id="groupId"
      @member-removed="memberRemoved"
    />
    <b-modal
      id="members-modal"
      :title="$t('createGuild')"
      size="md"
      :hide-footer="true"
    >
      <div
        slot="modal-header"
        class="header-wrap"
      >
        <div class="row">
          <div class="col-6">
            <h1 v-once>
              {{ $t('members') }}
            </h1>
          </div>
          <div class="col-6">
            <button
              class="close"
              type="button"
              aria-label="Close"
              @click="close()"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
        <div class="row d-flex align-items-center">
          <div class="col-4">
            <input
              v-model="searchTerm"
              class="form-control input-search"
              type="text"
              :placeholder="$t('search')"
            >
          </div>
          <div class="col-5">
            <select-list
              :items="sortOptions"
              :value="optionEntryBySelectedValue"
              key-prop="value"
              @select="changeSortOption($event)"
            >
              <template v-slot:item="{ item }">
                <span
                  v-if="item"
                  class="label"
                >{{ item.text }}</span>
              </template>
            </select-list>
          </div>
          <div class="col-3">
            <select-list
              :items="sortDirections"
              :value="directionEntryBySelectedValue"
              key-prop="value"
              @select="changeSortDirection($event)"
            >
              <template v-slot:item="{ item }">
                <span
                  v-if="item"
                  class="label"
                >{{ item.text }}</span>
              </template>
            </select-list>
          </div>
        </div>
      </div>
      <div
        v-if="sortDirty && group.type === 'party'"
        class="row apply-options d-flex justify-content-center"
      >
        <a @click="applySortOptions()">{{ $t('applySortToHeader') }}</a>
      </div>
      <div
        v-if="invites.length > 0"
        class="row"
      >
        <div class="col-6 offset-3 nav">
          <div
            class="nav-item"
            :class="{active: selectedPage === 'members'}"
            @click="viewMembers()"
          >
            {{ $t('members') }}
          </div>
          <div
            class="nav-item"
            :class="{active: selectedPage === 'invites'}"
            @click="viewInvites()"
          >
            {{ $t('invites') }}
          </div>
        </div>
      </div>
      <loading-gryphon v-if="loading" />
      <div
        v-if="selectedPage === 'members' && !loading"
        :class="{'mt-1': invites.length === 0}"
      >
        <div
          v-for="(member, index) in sortedMembers"
          :key="member._id"
          class="row"
        >
          <div class="col-11 no-padding-left">
            <member-details
              :member="member"
              :class-badge-position="'next-to-name'"
            />
          </div>
          <div class="col-1 actions">
            <b-dropdown right="right">
              <div
                slot="button-content"
                class="svg-icon inline dots"
                v-html="icons.dots"
              ></div>
              <b-dropdown-item @click="sendMessage(member)">
                <span class="dropdown-icon-item">
                  <div
                    class="svg-icon inline"
                    v-html="icons.messageIcon"
                  ></div>
                  <span class="text">{{ $t('sendMessage') }}</span>
                </span>
              </b-dropdown-item>
              <b-dropdown-item
                v-if="shouldShowLeaderFunctions(member._id)"
                @click="promoteToLeader(member)"
              >
                <span class="dropdown-icon-item">
                  <div
                    class="svg-icon inline"
                    v-html="icons.starIcon"
                  ></div>
                  <span class="text">{{ $t('promoteToLeader') }}</span>
                </span>
              </b-dropdown-item>
              <b-dropdown-item
                v-if="shouldShowAddManager(member._id)"
                @click="addManager(member._id)"
              >
                <span class="dropdown-icon-item">
                  <div
                    class="svg-icon inline"
                    v-html="icons.starIcon"
                  ></div>
                  <span class="text">{{ $t('addManager') }}</span>
                </span>
              </b-dropdown-item>
              <b-dropdown-item
                v-if="shouldShowRemoveManager(member._id)"
                @click="removeManager(member._id)"
              >
                <span class="dropdown-icon-item">
                  <div
                    class="svg-icon inline block-icon"
                    v-html="icons.blockIcon"
                  ></div>
                  <span class="text">{{ $t('removeManager2') }}</span>
                </span>
              </b-dropdown-item>
              <b-dropdown-item
                v-if="challengeId"
                @click="viewProgress(member)"
              >
                <span class="dropdown-icon-item">
                  <span class="text">{{ $t('viewProgress') }}</span>
                </span>
              </b-dropdown-item>
              <b-dropdown-item
                v-if="shouldShowLeaderFunctions(member._id)"
                @click="removeMember(member, index)"
              >
                <span class="dropdown-icon-item">
                  <div
                    class="svg-icon inline block-icon"
                    v-html="icons.blockIcon"
                  ></div>
                  <span class="text">{{ $t('removeMember') }}</span>
                </span>
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
        <div
          v-if="isLoadMoreAvailable"
          class="row"
        >
          <div class="col-12 text-center">
            <button
              class="btn btn-secondary"
              @click="loadMoreMembers()"
            >
              {{ $t('loadMore') }}
            </button>
          </div>
        </div>
        <div
          v-if="members.length > 3"
          class="row gradient"
        ></div>
      </div>
      <div v-if="selectedPage === 'invites' && !loading">
        <div
          v-for="(member, index) in invites"
          :key="member._id"
          class="row"
        >
          <div class="col-11 no-padding-left">
            <member-details :member="member" />
          </div>
          <div class="col-1 actions">
            <b-dropdown right="right">
              <div
                slot="button-content"
                class="svg-icon inline dots"
                v-html="icons.dots"
              ></div>
              <b-dropdown-item
                v-if="isLeader"
                @click="removeInvite(member, index)"
              >
                <span class="dropdown-icon-item">
                  <div
                    v-if="isLeader"
                    class="svg-icon inline block-icon"
                    v-html="icons.blockIcon"
                  ></div>
                  <span class="text">{{ $t('removeInvite') }}</span>
                </span>
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<style lang='scss'>
  #members-modal {
    .modal-header {
      background-color: #edecee;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    }

    .small-text, .character-name {
      color: #878190;
    }

    .no-padding-left {
      padding-left: 0;
    }

    .modal-body {
      padding-left: 0;
      padding-right: 0;
      padding-bottom: 0;
      padding-top: 0;
    }

    .member-details {
      margin: 0;
    }

    .actions .dropdown-toggle::after {
      content: none !important;
    }
  }
</style>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  .apply-options {
    padding: 1em;
    margin: 0;
    background-color: #f9f9f9;
    color: #2995cd;
  }

  .header-wrap {
    width: 100%;
  }

  .form-control {
    font-size: 0.9rem;
  }

  h1 {
    color: #4f2a93;
  }

  .actions {
    padding-top: 5em;

    .dots {
      height: 16px;
      width: 4px;
    }

    .btn-group {
      margin-left: -2em;
      margin-top: -2em;
    }

    .action-icon {
      margin-right: 1em;
    }
  }

  #members-modal_modal_body {
    padding: 0;
    max-height: 450px;

    .col-8 {
      margin-left: 0;
    }

    .member-details {
      margin: 0;
    }

    .member-stats {
      width: 382px;
      height: 147px;
    }

    .gradient {
      background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0), #ffffff);
      height: 50px;
      width: 100%;
      position: absolute;
      bottom: 0px;
      margin-left: -15px;
    }
  }

  .dropdown-icon-item .svg-icon {
    width: 20px;
  }

  .nav {
    font-weight: bold;
    margin-bottom: .5em;
    margin-top: .5em;
  }

  .nav-item {
    display: inline-block;
    font-size: 16px;
    margin: 0 auto;
    padding: .5em;
    color: #878190;
  }

  .nav-item:hover, .nav-item.active {
    color: #4f2a93;
    border-bottom: 2px solid #4f2a93;
    cursor: pointer;
  }

  .block-icon {
    color:  $gray-200;
  }
</style>

<script>
import orderBy from 'lodash/orderBy';
import isEmpty from 'lodash/isEmpty';

import removeMemberModal from '@/components/members/removeMemberModal';
import loadingGryphon from '@/components/ui/loadingGryphon';
import MemberDetails from '../memberDetails';
import blockIcon from '@/assets/svg/block.svg';
import messageIcon from '@/assets/members/message.svg';
import starIcon from '@/assets/members/star.svg';
import dots from '@/assets/svg/dots.svg';
import SelectList from '@/components/ui/selectList';
import { PAGES } from '@/libs/consts';
import { userStateMixin } from '../../mixins/userState';

export default {
  components: {
    SelectList,
    MemberDetails,
    removeMemberModal,
    loadingGryphon,
  },
  mixins: [userStateMixin],
  props: ['hideBadge'],
  data () {
    return {
      sortOption: {
        // default sort options
        value: 'stats.class',
        direction: 'asc',
      },
      sortDirty: false,
      selectedPage: 'members',
      members: [],
      invites: [],
      memberToRemove: {},
      sortOptions: [
        {
          value: 'stats.class',
          text: this.$t('sortClass'),
        },
        {
          value: 'preferences.background',
          text: this.$t('sortBackground'),
        },
        {
          value: 'auth.timestamps.created',
          text: this.$t('sortDateJoined'),
        },
        {
          value: 'auth.timestamps.loggedin',
          text: this.$t('sortLogin'),
        },
        {
          value: 'stats.lvl',
          text: this.$t('sortLevel'),
        },
        {
          value: 'profile.name',
          text: this.$t('sortName'),
        },
        {
          value: 'contributor.level',
          text: this.$t('sortTier'),
        },
      ],
      sortDirections: [
        {
          value: 'asc',
          text: this.$t('ascendingAbbrev'),
        },
        {
          value: 'desc',
          text: this.$t('descendingAbbrev'),
        },
      ],
      searchTerm: '',
      icons: Object.freeze({
        blockIcon,
        messageIcon,
        starIcon,
        dots,
      }),
      userIdToMessage: '',
    };
  },
  computed: {
    isLeader () {
      if (!this.group || !this.group.leader) return false;
      return this.user._id === this.group.leader || this.user._id === this.group.leader._id;
    },
    isAdmin () {
      return Boolean(this.hasPermission(this.user, 'moderator'));
    },
    isLoadMoreAvailable () {
      // Only available if the current length of `members` is less than the
      // total size of the Group/Challenge
      return this.members.length < this.$store.state.memberModalOptions.memberCount;
    },
    groupIsSubscribed () {
      return this.group.purchased && this.group.purchased.active;
    },
    group () {
      return this.$store.state.memberModalOptions.group;
    },
    groupId () {
      return this.$store.state.memberModalOptions.groupId || this.group._id;
    },
    challengeId () {
      return this.$store.state.memberModalOptions.challengeId;
    },
    loading () {
      return this.$store.state.memberModalOptions.loading;
    },
    sortedMembers () {
      let sortedMembers = this.members.slice(); // shallow clone to avoid infinite loop

      if (!isEmpty(this.sortOption)) {
        // Use the memberlist filtered by searchTerm
        if (this.sortOption.value === 'profile.name') {
          // If members are to be sorted by name, use localeCompare for case-
          // insensitive sort
          sortedMembers.sort(
            (a, b) => {
              if (this.sortOption.direction === 'desc') {
                return b.profile.name.localeCompare(a.profile.name);
              }

              return a.profile.name.localeCompare(b.profile.name);
            },
          );
        } else {
          sortedMembers = orderBy(
            sortedMembers,
            [this.sortOption.value],
            [this.sortOption.direction],
          );
        }
      }

      return sortedMembers;
    },
    optionEntryBySelectedValue () {
      return this.sortOptions.find(o => o.value === this.sortOption.value);
    },
    directionEntryBySelectedValue () {
      return this.sortDirections.find(o => o.value === this.sortOption.direction);
    },
  },
  watch: {
    // Watches `searchTerm` and if present, performs a `searchMembers` action
    // and usual `getMembers` otherwise
    searchTerm () {
      if (this.searchTerm) {
        this.searchMembers(this.searchTerm);
      } else {
        this.getMembers();
      }
    },
  },
  mounted () {
    this.$root.$on('habitica:show-member-modal', data => {
      // @TODO: Remove store
      this.$store.state.memberModalOptions.challengeId = data.challengeId;
      this.$store.state.memberModalOptions.groupId = data.groupId;
      this.$store.state.memberModalOptions.group = data.group;
      this.$store.state.memberModalOptions.memberCount = data.memberCount;
      this.$store.state.memberModalOptions.viewingMembers = data.viewingMembers;
      this.$store.state.memberModalOptions.fetchMoreMembers = data.fetchMoreMembers;
      this.$root.$emit('bv::show::modal', 'members-modal');
      this.getMembers();
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:show-member-modal');
  },
  methods: {
    sendMessage (member) {
      this.$store.dispatch('user:newPrivateMessageTo', {
        member,
      });

      this.$root.$emit('bv::hide::modal', 'members-modal');
      this.$router.push(PAGES.PRIVATE_MESSAGES);
    },
    async searchMembers (searchTerm = '') {
      this.members = await this.$store.state.memberModalOptions.fetchMoreMembers({
        challengeId: this.challengeId,
        groupId: this.groupId,
        searchTerm,
        includeAllPublicFields: true,
      });
    },
    async getMembers () {
      this.members = this.$store.state.memberModalOptions.viewingMembers;

      await this.searchMembers('');

      const { groupId } = this;
      if (groupId && groupId !== 'challenge') {
        const invites = await this.$store.dispatch('members:getGroupInvites', {
          groupId,
          includeAllPublicFields: true,
        });
        if (this.selectedPage === 'invites' && invites.length === 0) this.viewMembers();
        this.invites = invites;
      }
    },
    async clickMember (uid, forceShow) {
      const user = this.$store.state.user.data;

      if (user._id === uid && !forceShow) {
        if (this.$route.name === 'tasks') {
          this.$route.router.go('options.profile.avatar');
          return;
        }

        this.$route.router.go('tasks');
        return;
      }

      await this.$store.dispatch('members:selectMember', {
        memberId: uid,
      });

      this.$root.$emit('bv::show::modal', 'members-modal');
    },
    async removeMember (member, index) {
      this.memberToRemove = member;
      this.memberToRemove.index = index;
      this.$root.$emit('bv::show::modal', 'remove-member');
    },
    memberRemoved () {
      this.members.splice(this.memberToRemove.index, 1);
      this.group.memberCount -= 1;
      this.memberToRemove = {};
    },
    async quickReply (uid) {
      this.memberToReply = uid;
      await this.$store.dispatch('members:selectMember', {
        memberId: uid,
      });
      this.$root.$emit('bv::show::modal', 'private-message'); //  MemberModalCtrl
    },
    async addManager (memberId) {
      await this.$store.dispatch('guilds:addManager', {
        groupId: this.groupId,
        memberId,
      });
      window.alert(this.$t('managerAdded')); // eslint-disable-line no-alert
    },
    async removeManager (memberId) {
      await this.$store.dispatch('guilds:removeManager', {
        groupId: this.groupId,
        memberId,
      });
      window.alert(this.$t('managerRemoved')); // eslint-disable-line no-alert
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'members-modal');
    },
    changeSortOption (e) {
      this.sortOption.value = e.value;
      this.sort();
    },
    changeSortDirection (e) {
      this.sortOption.direction = e.value;
      this.sort();
    },
    sort () {
      this.sortDirty = true;
      this.members = orderBy(this.members, [this.sortOption.value], [this.sortOption.direction]);
    },
    async applySortOptions () {
      const settings = {
        'party.order': this.sortOption.value,
        'party.orderAscending': this.sortOption.direction,
      };
      await this.$store.dispatch('user:set', settings);
      this.sortDirty = false;
    },
    async loadMoreMembers () {
      const lastMember = this.members[this.members.length - 1];
      if (!lastMember) return;

      const newMembers = await this.$store.state.memberModalOptions.fetchMoreMembers({
        challengeId: this.challengeId,
        groupId: this.groupId,
        lastMemberId: lastMember._id,
        includeAllPublicFields: true,
      });

      this.members = this.members.concat(newMembers);
    },
    viewMembers () {
      this.selectedPage = 'members';
    },
    viewInvites () {
      this.selectedPage = 'invites';
    },
    async removeInvite (member, index) {
      this.invites.splice(index, 1);
      await this.$store.dispatch('members:removeMember', {
        memberId: member._id,
        groupId: this.groupId,
      });
      if (this.invites.length === 0) this.viewMembers();
    },
    async promoteToLeader (member) {
      const groupData = { ...this.group };

      groupData.leader = member._id;
      await this.$store.dispatch('guilds:update', { group: groupData });

      window.alert(this.$t('leaderChanged')); // eslint-disable-line no-alert

      groupData.leader = member;
      this.$root.$emit('updatedGroup', groupData);
    },
    viewProgress (member) {
      this.$root.$emit('habitica:challenge:member-progress', {
        progressMemberId: member._id,
      });
    },
    shouldShowAddManager (memberId) {
      if (!this.isLeader && !this.isAdmin) return false;
      if (memberId === this.group.leader || memberId === this.group.leader._id) return false;
      return this.groupIsSubscribed && !(this.group.managers && this.group.managers[memberId]);
    },
    shouldShowRemoveManager (memberId) {
      if (!this.isLeader && !this.isAdmin) return false;
      return this.group.managers && this.group.managers[memberId];
    },
    shouldShowLeaderFunctions (memberId) {
      return !this.challengeId && (this.isLeader || this.isAdmin) && this.user._id !== memberId;
    },
  },
};
</script>
