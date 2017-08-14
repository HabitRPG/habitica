<template lang="pug">
.claim-bottom-message.col-12
  .task-unclaimed(v-if='!approvalRequested && !multipleApprovalsRequested')
    | {{ message }}
    a(@click='claim()') Claim
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
      let assignedUsers = this.task.group.assignedUsers;
      let assignedUsersLength = assignedUsers.length;
      let userIsAssigned = assignedUsers.indexOf(this.user._id) !== -1;

      if (assignedUsersLength === 1 && !userIsAssigned) {
        return `Claimed by ${assignedUsers}`;
      } else if (assignedUsersLength > 1 && !userIsAssigned) {
        return `Claimed by ${assignedUsersLength} members`;
      } else if (assignedUsersLength > 1 && userIsAssigned) {
        return `Claimed by you and ${assignedUsersLength} members`;
      } else if (userIsAssigned) {
        return 'You have claimed this';
      } else if (assignedUsersLength === 0) {
        return 'This message is unclaimed';
      }
    },
    approvalRequested () {
      if (this.approvals && this.approvals.length === 1) return true;
    },
    multipleApprovalsRequested () {
      if (this.approvals && this.approvals.length > 1) return true;
    },
  },
  methods: {
    claim () {
      if (!confirm('Are you sure you want to claim this task?')) return;
      this.$store.dispatch('tasks:assignTask', {
        taskId: this.task._id,
        userId: this.user._id,
      });
      this.task.group.assignedUsers.push(this.user._id);
      // @TODO: Reload user tasks?
    },
    unassign () {
      if (!confirm('Are you sure you want to unclaim this task?')) return;
      this.$store.dispatch('tasks:unassignTask', {
        taskId: this.task._id,
        userId: this.user._id,
      });
      // @TODO:
      // this.task.group.assignedUsers.push(this.user._id);
    },
  },
};
</script>
