<template lang="pug">
.claim-bottom-message.col-12(v-if='task.group.approvals && task.group.approvals.length > 0')
  .task-unclaimed(v-if='!approvalRequested && !multipleApprovalsRequested')
    | {{ message }}
  .task-single-approval(v-if='approvalRequested')
    | Approve or not
  .task-multi-approval(v-if='multipleApprovalsRequested')
    | View Approvals
</template>

<script>
import { mapState } from 'client/libs/store';
export default {
  props: ['task'],
  computed: {
    ...mapState({user: 'user.data'}),
    message () {
      let approvals = this.task.group.approvals;
      let approvalsLength = approvals.length;
      let userIsRequesting = approvals.indexOf(this.user._id) !== -1;

      if (approvalsLength === 1 && !userIsRequesting) {
        return `${assignedUsers} requesting`;
      } else if (approvalsLength > 1 && !userIsRequesting) {
        return `${assignedUsersLength} members`;
      } else if (approvalsLength === 1 && userIsRequesting) {
        return `You are requesting approval`;
      }
    },
    approvalRequested () {
      if (this.approvals && this.approvals.length === 1) return true;
    },
    multipleApprovalsRequested () {
      if (this.approvals && this.approvals.length > 1) return true;
    },
  },
  mounted () {
    // @TODO: FAke approvals for now
    this.task.group.approvals = [this.user._id];
  },
};
</script>
