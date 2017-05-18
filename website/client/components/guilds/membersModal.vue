<template lang="pug">
div
  button.btn.btn-primary.btn-purple(b-btn, @click="$root.$emit('show::modal','members-modal')") {{ $t('viewMembers') }}

  b-modal#members-modal(:title="$t('createGuild')")
    ul(v-for='member in members')
      li(@click='clickMember') {{member}}
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
  },
};
</script>
