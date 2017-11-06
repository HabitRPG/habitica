<template lang="pug">
div
  approval-modal(:task='task')
  .claim-bottom-message.col-12
    .task-unclaimed(v-if='!approvalRequested && !multipleApprovalsRequested')
      | {{ message }}
      a(@click='claim()', v-if='!userIsAssigned') Claim
      a(@click='unassign()', v-if='userIsAssigned') Remove Claim
    .row.task-single-approval(v-if='approvalRequested')
      .col-6.text-center
        a(@click='approve()') Approve Task
      // @TODO: Implement in v2 .col-6.text-center
        a Needs work
    .text-center.task-multi-approval(v-if='multipleApprovalsRequested')
      a(@click='showRequests()') View Requests
</template>

<style scoped>
.claim-bottom-message {
  z-index: 9;
}

.task-unclaimed a {
  float: right;
}
</style>

<script>
import findIndex from 'lodash/findIndex';
import { mapState } from 'client/libs/store';
import approvalModal from './approvalModal';

export default {
  props: ['task', 'group'],
  components: {
    approvalModal,
  },
  computed: {
    ...mapState({user: 'user.data'}),
    userIsAssigned () {
      return this.task.group.assignedUsers && this.task.group.assignedUsers.indexOf(this.user._id) !== -1;
    },
    message () {
      let assignedUsers = this.task.group.assignedUsers;
      let assignedUsersNames = [];
      let assignedUsersLength = assignedUsers.length;

      // @TODO: Eh, I think we only ever display one user name
      if (this.group && this.group.members) {
        assignedUsers.forEach(userId => {
          let index = findIndex(this.group.members, (member) => {
            return member._id === userId;
          });
          let assignedMember = this.group.members[index];
          assignedUsersNames.push(assignedMember.profile.name);
        });
      }

      if (assignedUsersLength === 1 && !this.userIsAssigned) {
        return `Assigned to ${assignedUsersNames[0]}`;
      } else if (assignedUsersLength > 1 && !this.userIsAssigned) {
        return `Assigned to ${assignedUsersLength} members`;
      } else if (assignedUsersLength > 1 && this.userIsAssigned) {
        return `Assigned to you and ${assignedUsersLength} members`;
      } else if (this.userIsAssigned) {
        return 'You are assigned to this task';
      } else if (assignedUsersLength === 0) {
        return 'This task is unassigned';
      }
    },
    approvalRequested () {
      if (this.task.approvals && this.task.approvals.length === 1) return true;
    },
    multipleApprovalsRequested () {
      if (this.task.approvals && this.task.approvals.length > 1) return true;
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
      let index = this.task.group.assignedUsers.indexOf(this.user._id);
      this.task.group.assignedUsers.splice(index, 1);
      // @TODO: Reload user tasks?
    },
    approve () {
      if (!confirm('Are you sure you want to approve this task?')) return;
      let userIdToApprove = this.task.group.assignedUsers[0];
      this.$store.dispatch('tasks:unassignTask', {
        taskId: this.task._id,
        userId: userIdToApprove,
      });
      this.task.group.assignedUsers.splice(0, 1);
      this.task.approvals.splice(0, 1);
    },
    reject () {

    },
    showRequests () {
      this.$root.$emit('show::modal', 'approval-modal');
    },
  },
};
</script>
