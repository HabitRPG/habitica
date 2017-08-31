<template lang="pug">
div
  b-modal#members-modal(:title="$t('createGuild')", size='lg')
    .header-wrap(slot="modal-header")
      .row
        .col-6
          h1(v-once) {{$t('members')}}
        .col-6
          button(type="button" aria-label="Close" class="close", @click='close()')
            span(aria-hidden="true") ×
      .row
        .form-group.col-6
          input.form-control.search(type="text", :placeholder="$t('search')", v-model='searchTerm')
        .col-4.offset-2
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', @click='sort(sortOption.value)', :key='sortOption.value') {{sortOption.text}}
    .row(v-for='member in sortedMembers')
      .col-8.offset-1
        member-details(:member='member')
      .col-3.actions
        b-dropdown(text="...", right=true)
          b-dropdown-item(@click='sort(option.value)', v-if='isLeader')
            span.dropdown-icon-item
              .svg-icon.inline(v-html="icons.removeIcon", v-if='isLeader')
              span.text {{$t('removeMember')}}
          b-dropdown-item(@click='sort(option.value)')
            span.dropdown-icon-item
              .svg-icon.inline(v-html="icons.messageIcon")
              span.text {{$t('sendMessage')}}
          b-dropdown-item(@click='sort(option.value)', v-if='isLeader')
            span.dropdown-icon-item
              .svg-icon.inline(v-html="icons.starIcon")
              span.text {{$t('promoteToLeader')}}
          b-dropdown-item(@click='sort(option.value)', v-if='isLeader && groupIsSubscribed')
            span.dropdown-icon-item
              .svg-icon.inline(v-html="icons.starIcon")
              span.text {{$t('addManager')}}
          b-dropdown-item(@click='sort(option.value)', v-if='isLeader && groupIsSubscribed')
            span.dropdown-icon-item
              .svg-icon.inline(v-html="icons.removeIcon")
              span.text {{$t('removeManager2')}}
    .row.gradient(v-if='members.length > 3')
</template>

<style lang='scss' scoped>
  header {
    background-color: #edecee;
    border-radius: 4px 4px 0 0;
  }

  .header-wrap {
    width: 100%;
  }

  h1 {
    color: #4f2a93;
  }

  .actions {
    padding-top: 5em;

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
</style>

<script>
// @TODO: Move this under members directory
import sortBy from 'lodash/sortBy';
import bModal from 'bootstrap-vue/lib/components/modal';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import { mapState } from 'client/libs/store';

import MemberDetails from '../memberDetails';
import removeIcon from 'assets/members/remove.svg';
import messageIcon from 'assets/members/message.svg';
import starIcon from 'assets/members/star.svg';

export default {
  props: ['hideBadge'],
  components: {
    bModal,
    bDropdown,
    bDropdownItem,
    MemberDetails,
  },
  data () {
    return {
      sortOption: '',
      members: [],
      memberToRemove: '',
      sortOptions: [
        {
          value: 'level',
          text: this.$t('tier'),
        },
        {
          value: 'name',
          text: this.$t('name'),
        },
        {
          value: 'lvl',
          text: this.$t('level'),
        },
        {
          value: 'class',
          text: this.$t('class'),
        },
      ],
      searchTerm: '',
      icons: Object.freeze({
        removeIcon,
        messageIcon,
        starIcon,
      }),
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    isLeader () {
      if (!this.group.leader) return false;
      return this.user._id === this.group.leader || this.user._id === this.group.leader._id;
    },
    groupIsSubscribed () {
      return this.group.purchased.active;
    },
    group () {
      return this.$store.state.memberModalOptions.group;
    },
    groupId () {
      return this.$store.state.memberModalOptions.groupId || this.group._id;
    },
    sortedMembers () {
      let sortedMembers = this.members;
      if (!this.sortOption) return sortedMembers;

      sortedMembers = sortBy(this.members, [(member) => {
        if (this.sortOption === 'tier') {
          if (!member.contributor) return;
          return member.contributor.level;
        } else if (this.sortOption === 'name') {
          return member.profile.name;
        } else if (this.sortOption === 'lvl') {
          return member.stats.lvl;
        } else if (this.sortOption === 'class') {
          return member.stats.class;
        }
      }]);

      return this.members;
    },
  },
  watch: {
    groupId () {
      // @TOOD: We might not need this since groupId is computed now
      this.getMembers();
    },
    group () {
      this.getMembers();
    },
  },
  methods: {
    async getMembers () {
      let groupId = this.groupId;
      if (groupId && groupId !== 'challenge') {
        let members = await this.$store.dispatch('members:getGroupMembers', {
          groupId,
          includeAllPublicFields: true,
        });
        this.members = members;
      }

      if (this.$store.state.memberModalOptions.viewingMembers.length > 0) {
        this.members = this.$store.state.viewingMembers;
      }
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

      this.$root.$emit('show::modal', 'members-modal');
    },
    async removeMember (member) {
      this.memberToRemove = member;
      this.$root.$emit('show::modal', 'remove-member');
    },
    async confirmRemoveMember (confirmation) {
      if (!confirmation) {
        this.memberToRemove = '';
        return;
      }

      await this.$store.dispatch('members:removeMember', {
        memberId: this.memberToRemove._id,
        groupId: this.group._id,
        message: this.removeMessage,
      });

      this.memberToRemove = '';
      this.removeMessage = '';
    },
    async quickReply (uid) {
      this.memberToReply = uid;
      await this.$store.dispatch('members:selectMember', {
        memberId: uid,
      });
      this.$root.$emit('show::modal', 'private-message'); //  MemberModalCtrl
    },
    async addManager (memberId) {
      await this.$store.dispatch('group:addManager', {
        memberId,
      });
    },
    async removeManager (memberId) {
      await this.$store.dispatch('group:removeManager', {
        memberId,
      });
    },
    close () {
      this.$root.$emit('hide::modal', 'members-modal');
    },
    sort (option) {
      this.sortOption = option;
    },
  },
};
</script>
