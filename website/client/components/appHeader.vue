<template lang="pug">
#app-header.row
  user-list-detail(:user="user")
  .no-party.d-flex.justify-content-center.text-center(v-if="!user.party._id")
    .align-self-center(v-once)
      h3 {{ $t('battleWithFriends') }}
      span.small-text(v-html="$t('inviteFriendsParty')")
      br
      button.btn.btn-primary {{ $t('startAParty') }}
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

#app-header {
  padding-left: 14px;
  margin-top: 56px;
  background: $purple-50;
  height: 204px;
  color: $header-color;
}

.no-party {
  flex-grow: 1;

  .small-text {
    color: $header-color;
  }

  h3 {
    color: $white;
    margin-bottom: 4px;
  }

  button {
    margin-top: 16px;
  }
}
</style>

<script>
import { mapState } from 'client/libs/store';
import UserListDetail from './userListDetail';

export default {
  components: {
    UserListDetail,
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
};
</script>
