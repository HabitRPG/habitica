<template lang="pug">
.claim-bottom-message.col-12.text-center(v-if='task.approvals && task.approvals.length > 0', :class="{approval: userIsAdmin}")
  .task-unclaimed
    | {{ message }}
</template>

<style lang="scss" scoped>
.claim-bottom-message {
  z-index: 9;
}

.approval {
  background: #24cc8f;
  color: #fff;
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
      let userIsRequesting = this.task.group.approvals && this.task.group.approvals.indexOf(this.user._id) !== -1;

      if (approvalsLength === 1 && !userIsRequesting) {
        return this.$t('youAreRequestingApproval', {userName: approvals[0].userId.profile.name});
      } else if (approvalsLength > 1 && !userIsRequesting) {
        return this.$t('youAreRequestingApproval', {userCount: approvalsLength});
      } else if (approvalsLength === 1 && userIsRequesting) {
        return this.$t('youAreRequestingApproval');
      }
    },
    userIsAdmin () {
      return this.group.leader.id === this.user._id;
    },
  },
};
</script>
