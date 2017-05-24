<template lang="pug">
div
  button.btn.btn-primary.btn-purple(b-btn, @click="$root.$emit('show::modal','members-modal')") {{ $t('viewMembers') }}

  b-modal#members-modal(:title="$t('createGuild')")
    ul(v-for='member in members', :key='member')
      li(@click='clickMember') {{member}}
        button(@click='removeMember(member)', v-once) {{$t('remove')}}
        button(@click='quickReply(member)', v-once) {{$t('message')}}
        button(@click='addManager(member)', v-once) {{$t('addManager')}}
        button(@click='removeManager(member)', v-once) {{$t('addManager')}}

  b-modal#remove-member(:title="$t('confirmRemoveMember')")
    button(@click='confirmRemoveMember(member)', v-once) {{$t('remove')}}

  b-modal#private-message(:title="$t('confirmRemoveMember')")
    button(@click='confirmRemoveMember(member)', v-once) {{$t('remove')}}
</template>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import bBtn from 'bootstrap-vue/lib/components/button';

export default {
  props: ['group'],
  components: {
    bModal,
    bBtn,
  },
  data () {
    return {
      members: ['one', 'two'],
      memberToRemove: '',
    };
  },
  methods: {
    getMembers () {
      // We should get members here via store if they are not loaded
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
