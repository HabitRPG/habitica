<template lang="pug">
// @TODO: Move this to a member directory
div
  remove-member-modal(:member-to-remove='memberToRemove', :group-id='this.groupId' @member-removed='memberRemoved')
  b-modal#members-modal(:title="$t('createGuild')", size='md', :hide-footer='true')
    .header-wrap(slot="modal-header")
      .row
        .col-6
          h1(v-once) {{$t('members')}}
        .col-6
          button(type="button" aria-label="Close" class="close", @click='close()')
            span(aria-hidden="true") ×
      .row.d-flex.align-items-center
        .col-4
          input.form-control.input-search(type="text", :placeholder="$t('search')", v-model='searchTerm')
        .col
          select.form-control(@change='changeSortOption($event)')
            option(v-for='sortOption in sortOptions', :value='sortOption.value') {{sortOption.text}}
        .col-3
          select.form-control(@change='changeSortDirection($event)')
            option(v-for='sortDirection in sortDirections', :value='sortDirection.value') {{sortDirection.text}}

    .row.apply-options.d-flex.justify-content-center(v-if='sortDirty && group.type === "party"')
      a(@click='applySortOptions()') {{ $t('applySortToHeader') }}
    .row(v-if='invites.length > 0')
      .col-6.offset-3.nav
        .nav-item(@click='viewMembers()', :class="{active: selectedPage === 'members'}") {{ $t('members') }}
        .nav-item(@click='viewInvites()', :class="{active: selectedPage === 'invites'}") {{ $t('invites') }}
    div(v-if='selectedPage === "members"')
      .row(v-for='(member, index) in sortedMembers')
        .col-11.no-padding-left
          member-details(:member='member')
        .col-1.actions
          b-dropdown(right=true)
            .svg-icon.inline.dots(slot='button-content', v-html="icons.dots")
            b-dropdown-item(@click='sendMessage(member)')
              span.dropdown-icon-item
                .svg-icon.inline(v-html="icons.messageIcon")
                span.text {{$t('sendMessage')}}
            b-dropdown-item(@click='promoteToLeader(member)', v-if='shouldShowLeaderFunctions(member._id)')
              span.dropdown-icon-item
                .svg-icon.inline(v-html="icons.starIcon")
                span.text {{$t('promoteToLeader')}}
            b-dropdown-item(@click='addManager(member._id)', v-if='shouldShowAddManager(member._id)')
              span.dropdown-icon-item
                .svg-icon.inline(v-html="icons.starIcon")
                span.text {{$t('addManager')}}
            b-dropdown-item(@click='removeManager(member._id)', v-if='shouldShowRemoveManager(member._id)')
              span.dropdown-icon-item
                .svg-icon.inline(v-html="icons.removeIcon")
                span.text {{$t('removeManager2')}}
            b-dropdown-item(@click='viewProgress(member)', v-if='challengeId')
              span.dropdown-icon-item
                span.text {{ $t('viewProgress') }}
            b-dropdown-item(@click='removeMember(member, index)', v-if='shouldShowLeaderFunctions(member._id)')
              span.dropdown-icon-item
                .svg-icon.inline(v-html="icons.removeIcon")
                span.text {{$t('removeMember')}}
      .row(v-if='isLoadMoreAvailable')
        .col-12.text-center
          button.btn.btn-secondary(@click='loadMoreMembers()') {{ $t('loadMore') }}
      .row.gradient(v-if='members.length > 3')
    div(v-if='selectedPage === "invites"')
      .row(v-for='(member, index) in invites')
        .col-11.no-padding-left
          member-details(:member='member')
        .col-1.actions
          b-dropdown(right=true)
            .svg-icon.inline.dots(slot='button-content', v-html="icons.dots")
            b-dropdown-item(@click='removeInvite(member, index)', v-if='isLeader')
              span.dropdown-icon-item
                .svg-icon.inline(v-html="icons.removeIcon", v-if='isLeader')
                span.text {{$t('removeInvite')}}
    .modal-footer
      button.btn.btn-primary(@click='close()') {{ $t('close') }}
</template>

<style lang='scss'>
  #members-modal {
    .modal-header {
      background-color: #edecee;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    }

    .modal-footer {
      background-color: #edecee;
      border-radius: 0 0 8px 8px;
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
</style>

<script>
import orderBy from 'lodash/orderBy';
import isEmpty from 'lodash/isEmpty';
import { mapState } from 'client/libs/store';

import removeMemberModal from 'client/components/members/removeMemberModal';
import MemberDetails from '../memberDetails';
import removeIcon from 'assets/members/remove.svg';
import messageIcon from 'assets/members/message.svg';
import starIcon from 'assets/members/star.svg';
import dots from 'assets/svg/dots.svg';

export default {
  props: ['hideBadge'],
  components: {
    MemberDetails,
    removeMemberModal,
  },
  data () {
    return {
      sortOption: {},
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
        removeIcon,
        messageIcon,
        starIcon,
        dots,
      }),
      userIdToMessage: '',
    };
  },
  mounted () {
    this.$root.$on('habitica:show-member-modal', (data) => {
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
  destroyed () {
    this.$root.$off('habitica:show-member-modal');
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isLeader () {
      if (!this.group || !this.group.leader) return false;
      return this.user._id === this.group.leader || this.user._id === this.group.leader._id;
    },
    isAdmin () {
      return Boolean(this.user.contributor.admin);
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
    sortedMembers () {
      let sortedMembers = this.members;

      if (!isEmpty(this.sortOption)) {
        // Use the memberlist filtered by searchTerm
        sortedMembers = orderBy(sortedMembers, [this.sortOption.value], [this.sortOption.direction]);
      }

      return sortedMembers;
    },
  },
  watch: {
    groupId () {
      // @TOOD: We might not need this since groupId is computed now
      this.getMembers();
    },
    challengeId () {
      this.getMembers();
    },
    group () {
      this.getMembers();
    },
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
  methods: {
    sendMessage (member) {
      this.$root.$emit('habitica::new-inbox-message', {
        userIdToMessage: member._id,
        displayName: member.profile.name,
        username: member.auth.local.username,
        backer: member.backer,
        contributor: member.contributor,
      });
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
      let groupId = this.groupId;

      if (groupId && groupId !== 'challenge') {
        let invites = await this.$store.dispatch('members:getGroupInvites', {
          groupId,
          includeAllPublicFields: true,
        });
        this.invites = invites;
      }

      this.members = this.$store.state.memberModalOptions.viewingMembers;
    },
    async clickMember (uid, forceShow) {
      let user = this.$store.state.user.data;

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
      this.memberToRemove =  {};
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
      alert(this.$t('managerAdded'));
    },
    async removeManager (memberId) {
      await this.$store.dispatch('guilds:removeManager', {
        groupId: this.groupId,
        memberId,
      });
      alert(this.$t('managerRemoved'));
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'members-modal');
    },
    changeSortOption (e) {
      this.sortOption.value = e.target.value;
      this.sort();
    },
    changeSortDirection (e) {
      this.sortOption.direction = e.target.value;
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

      let newMembers = await this.$store.state.memberModalOptions.fetchMoreMembers({
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
      this.viewMembers();
    },
    async promoteToLeader (member) {
      let groupData = Object.assign({}, this.group);

      groupData.leader = member._id;
      await this.$store.dispatch('guilds:update', {group: groupData});

      alert(this.$t('leaderChanged'));

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
