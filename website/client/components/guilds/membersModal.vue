<template lang="pug">
div
  .item-with-icon(@click="$root.$emit('show::modal','members-modal')")
    .svg-icon.shield(v-html="icons.goldGuildBadgeIcon")
    span.number {{group.memberCount}}
    div(v-once) {{ $t('members') }}

  b-modal#members-modal(:title="$t('createGuild')", size='lg')
    .header-wrap(slot="modal-header")
      .row
        .col-6
          h1(v-once) {{$t('members')}}
        .col-6
          button(type="button" aria-label="Close" class="close")
            span(aria-hidden="true") ×
      .row
        .form-group.col-6
          input.form-control.search(type="text", :placeholder="$t('search')", v-model='searchTerm')
        .col-4.offset-2
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', @click='sort(sortOption.value)', :key='sortOption.value') {{sortOption.text}}
    .row(v-for='member in members', :key='member', )
      .col-8.offset-1
        member-details(:member='member')
      .col-3.actions
        b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(@click='sort(option.value)')
            .svg-icon(v-html="icons.removeIcon")
            | {{$t('removeMember')}}
          b-dropdown-item(@click='sort(option.value)')
            .svg-icon(v-html="icons.messageIcon")
            | {{$t('sendMessage')}}
          b-dropdown-item(@click='sort(option.value)')
            .svg-icon(v-html="icons.starIcon")
            | {{$t('promoteToLeader')}}
          b-dropdown-item(@click='sort(option.value)')
            .svg-icon(v-html="icons.starIcon")
            | {{$t('addManager')}}
          b-dropdown-item(@click='sort(option.value)')
            .svg-icon(v-html="icons.removeIcon")
            | {{$t('removeManager2')}}
    .row-fluid.gradient

  b-modal#remove-member(:title="$t('confirmRemoveMember')")
    button(@click='confirmRemoveMember(member)', v-once) {{$t('remove')}}

  b-modal#private-message(:title="$t('confirmRemoveMember')")
    button(@click='confirmRemoveMember(member)', v-once) {{$t('remove')}}
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
      height: 200px;
      width: 100%;
      position: absolute;
      bottom: 0px;
    }
  }

  .item-with-icon {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: 1em;
    text-align: center;
  }

  .svg-icon.shield, .svg-icon.gem {
    width: 40px;
    margin-right: 1em;
  }

  .number {
    font-size: 22px;
    font-weight: bold;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

import MemberDetails from '../memberDetails';
import removeIcon from 'assets/members/remove.svg';
import messageIcon from 'assets/members/message.svg';
import starIcon from 'assets/members/star.svg';
import goldGuildBadgeIcon from 'assets/svg/gold-guild-badge.svg';

export default {
  props: ['group'],
  components: {
    bModal,
    bDropdown,
    bDropdownItem,
    MemberDetails,
  },
  created () {
    this.getMembers();
  },
  data () {
    return {
      members: [],
      memberToRemove: '',
      sortOptions: [
        {
          value: 'tier',
          text: this.$t('tier'),
        },
        {
          value: 'name',
          text: this.$t('name'),
        },
        {
          value: 'level',
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
        goldGuildBadgeIcon,
      }),
    };
  },
  methods: {
    async getMembers () {
      let members = await this.$store.dispatch('members:getGroupMembers', {
        groupId: this.group._id,
        includeAllPublicFields: true,
      });
      this.members = members;
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
  },
};
</script>
