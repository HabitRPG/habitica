<template lang="pug">
  .claim-top-message.d-flex.align-content-center(v-if='task.approvals && task.approvals.length > 0', :class="{'approval-action': userIsAdmin, 'approval-pending': !userIsAdmin}")
    .m-auto(v-html='message')
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  .claim-top-message {
    z-index: 9;
    height: 2rem;
    font-size: 12px;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    color: #fff;
  }

  .approval-action {
    background: $green-10;
  }

  .approval-pending {
    background: $gray-300;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
export default {
  props: ['task', 'group'],
  computed: {
    ...mapState({user: 'user.data'}),
    message () {
      let approvals = this.task.approvals;
      let approvalsLength = approvals.length;
      let userIsRequesting = approvals.findIndex((approval) => {
        return approval.userId.id === this.user._id;
      }) !== -1;

      if (approvalsLength === 1 && !userIsRequesting) {
        return this.$t('userRequestsApproval', {userName: approvals[0].userId.profile.name});
      } else if (approvalsLength > 1 && !userIsRequesting) {
        return this.$t('userCountRequestsApproval', {userCount: approvalsLength});
      } else if (approvalsLength === 1 && userIsRequesting) {
        return this.$t('youAreRequestingApproval');
      }
    },
    userIsAdmin () {
      return this.group.leader.id === this.user._id || this.group.managers[this.user._id];
    },
  },
};
</script>
