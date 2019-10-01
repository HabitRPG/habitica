<template lang="pug">
  .claim-top-message.d-flex.align-content-center(v-if='message', :class="{'approval-action': userIsAdmin, 'approval-pending': !userIsAdmin}")
    .m-auto(v-html='message')
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  .claim-top-message {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
    color: #fff;
    font-size: 12px;
    padding-bottom: 0.25rem;
    padding-top: 0.25rem;
    z-index: 9;
  }

  .approval-action {
    background: $green-100;
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
      let approvals = this.task.approvals || [];
      let approvalsLength = approvals.length;
      let userIsRequesting = approvals.findIndex((approval) => {
        return approval.userId.id === this.user._id;
      }) !== -1;

      if (approvalsLength === 1 && !userIsRequesting) {
        return this.$t('userRequestsApproval', {userName: approvals[0].userId.profile.name});
      } else if (approvalsLength > 1 && !userIsRequesting) {
        return this.$t('userCountRequestsApproval', {userCount: approvalsLength});
      } else if (approvalsLength === 1 && userIsRequesting || this.task.group.approval && this.task.group.approval.requested && !this.task.group.approval.approved) {
        return this.$t('youAreRequestingApproval');
      }
    },
    userIsAdmin () {
      return this.group && (this.group.leader.id === this.user._id || this.group.managers[this.user._id]);
    },
  },
};
</script>
