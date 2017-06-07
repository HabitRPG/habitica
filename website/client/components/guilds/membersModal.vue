<template lang="pug">
div
  button.btn.btn-primary(b-btn, @click="$root.$emit('show::modal','members-modal')") {{ $t('viewMembers') }}

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
            b-dropdown-item(v-for='sortOption in sortOptions', @click='sort(sortOption.value)') {{sortOption.text}}
    .row(v-for='member in members', :key='member', )
      .col-8.offset-1
        user-list-detail(:user='member')
      .col-3.actions
        b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(@click='sort(option.value)')
            img.action-icon(src='~assets/members/remove.svg')
            | {{$t('removeMember')}}
          b-dropdown-item(@click='sort(option.value)')
            img.action-icon(src='~assets/members/message.svg')
            | {{$t('sendMessage')}}
          b-dropdown-item(@click='sort(option.value)')
            img.action-icon(src='~assets/members/star.svg')
            | {{$t('promoteToLeader')}}
          b-dropdown-item(@click='sort(option.value)')
            img.action-icon(src='~assets/members/star.svg')
            | {{$t('addManager')}}
          b-dropdown-item(@click='sort(option.value)')
            img.action-icon(src='~assets/members/remove.svg')
            | {{$t('removeManager2')}}

  b-modal#remove-member(:title="$t('confirmRemoveMember')")
    button(@click='confirmRemoveMember(member)', v-once) {{$t('remove')}}

  b-modal#private-message(:title="$t('confirmRemoveMember')")
    button(@click='confirmRemoveMember(member)', v-once) {{$t('remove')}}
</template>

<style lang='scss'>
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
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

import UserListDetail from '../userListDetail';

export default {
  props: ['group'],
  components: {
    bModal,
    bDropdown,
    bDropdownItem,
    UserListDetail,
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
    clickMember (uid, forceShow) {
      let user = this.$store.state.user.data;

      if (user._id === uid && !forceShow) {
        if (this.$route.name === 'tasks') {
          this.$route.router.go('options.profile.avatar');
          return;
        }

        this.$route.router.go('tasks');
        return;
      }

      // $root.$emit('show::modal','members-modal')
      // We need the member information up top here, but then we pass it down to the modal controller
      // down below. Better way of handling this?
      // Members.selectMember(uid)
      //   .then(function () {
      //     $rootScope.openModal('member', {controller: 'MemberModalCtrl', windowClass: 'profile-modal', size: 'lg'});
      //   });
    },
    removeMember (member) {
      this.memberToRemove = member;
      this.$root.$emit('show::modal', 'remove-member');
    },
    confirmRemoveMember (confirmation) {
      if (!confirmation) {
        this.memberToRemove = '';
        return;
      }
      // Groups.Group.removeMember(
      //   $scope.removeMemberData.group._id,
      //   $scope.removeMemberData.member._id,
      //   $scope.removeMemberData.message
      // ).then(function (response) {
      //   if($scope.removeMemberData.isMember){
      //     _.pull($scope.removeMemberData.group.members, $scope.removeMemberData.member);
      //   }else{
      //     _.pull($scope.removeMemberData.group.invites, $scope.removeMemberData.member);
      //   }
      //
      //   $scope.removeMemberData = undefined;
      // });
    },
    quickReply (uid) {
      this.memberToReply = uid;
      this.$root.$emit('show::modal', 'private-message');
      // Members.selectMember(uid)
      //   .then(function (response) {
      //     $rootScope.openModal('private-message', {controller: 'MemberModalCtrl'});
      //   });
    },
    addManager () {
      // Groups.Group.addManager(this.group._id, this.group._newManager)
      //   .then(function (response) {
      //     this.group._newManager = '';
      //     this.group.managers = response.data.data.managers;
      //   });
    },
    removeManager (memberId) {
      this.memberToReply = memberId;
      // Groups.Group.removeManager(this.group._id, memberId)
      //   .then(function (response) {
      //     this.group._newManager = '';
      //     this.group.managers = response.data.data.managers;
      //   });
    },
  },
};
</script>
