<template>
  <div
    v-if="message"
    class="claim-top-message d-flex align-content-center"
    :class="{ 'approval-action': userIsAdmin || task.group.approval.approved,
              'approval-pending': !userIsAdmin && !task.group.approval.approved }"
  >
    <div
      class="m-auto"
      v-html="message"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
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
import { mapState } from '@/libs/store';

export default {
  props: ['task', 'group'],
  computed: {
    ...mapState({ user: 'user.data' }),
    message () {
      const approvals = this.task.approvals || [];
      const approvalsLength = approvals.length;
      const userIsRequesting = approvals
        .findIndex(approval => approval.userId.id === this.user._id) !== -1;

      if (approvalsLength === 1 && !userIsRequesting) {
        return this.$t('userRequestsApproval', { userName: approvals[0].userId.profile.name });
      }
      if (approvalsLength > 1 && !userIsRequesting) {
        return this.$t('userCountRequestsApproval', { userCount: approvalsLength });
      }
      if ((approvalsLength === 1 && userIsRequesting)
        || (this.task.group.approval
          && this.task.group.approval.requested
          && !this.task.group.approval.approved)) {
        return this.$t('youAreRequestingApproval');
      }
      if (this.task.group.approval.approved && !this.task.completed) {
        return this.$t('thisTaskApproved');
      }
      return null;
    },
    userIsAdmin () {
      return this.group
        && (this.group.leader.id === this.user._id || this.group.managers[this.user._id]);
    },
  },
};
</script>
