<template lang="pug">
div
  approval-modal(:task='task')
  .claim-bottom-message.col-12
    .task-unclaimed.d-flex.justify-content-between(v-if='!approvalRequested && !multipleApprovalsRequested')
      span {{ message }}
      a.text-right(@click='claim()', v-if='!userIsAssigned') {{ $t('claim') }}
      a.text-right(@click='unassign()', v-if='userIsAssigned') {{ $t('removeClaim') }}
    .row.task-single-approval(v-if='approvalRequested')
      .col-6.text-center
        a(@click='approve()') {{ $t('approveTask') }}
      .col-6.text-center
        a(@click='needsWork()') {{ $t('needsWork') }}
    .text-center.task-multi-approval(v-if='multipleApprovalsRequested')
      a(@click='showRequests()') {{ $t('viewRequests') }}
</template>

<style lang="scss", scoped>
.claim-bottom-message {
  z-index: 9;
}

.task-unclaimed {
  span {
    margin-right: 0.25rem;
  }

  a {
    display: inline-block;
  }
}
</style>

<script>
import findIndex from 'lodash/findIndex';
import { mapState } from 'client/libs/store';
import approvalModal from './approvalModal';
import sync from 'client/mixins/sync';

export default {
  mixins: [sync],
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
        return this.$t('assignedToUser', {userName: assignedUsersNames[0]});
      } else if (assignedUsersLength > 1 && !this.userIsAssigned) {
        return this.$t('assignedToMembers', {userCount: assignedUsersLength});
      } else if (assignedUsersLength > 1 && this.userIsAssigned) {
        return this.$t('assignedToYouAndMembers', {userCount: assignedUsersLength - 1});
      } else if (this.userIsAssigned) {
        return this.$t('youAreAssigned');
      } else if (assignedUsersLength === 0) {
        return this.$t('taskIsUnassigned');
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
    async claim () {
      if (!confirm(this.$t('confirmClaim'))) return;

      let taskId = this.task._id;
      // If we are on the user task
      if (this.task.userId) {
        taskId = this.task.group.taskId;
      }

      await this.$store.dispatch('tasks:assignTask', {
        taskId,
        userId: this.user._id,
      });
      this.task.group.assignedUsers.push(this.user._id);
      this.sync();
    },
    async unassign () {
      if (!confirm(this.$t('confirmUnClaim'))) return;

      let taskId = this.task._id;
      // If we are on the user task
      if (this.task.userId) {
        taskId = this.task.group.taskId;
      }

      await this.$store.dispatch('tasks:unassignTask', {
        taskId,
        userId: this.user._id,
      });
      let index = this.task.group.assignedUsers.indexOf(this.user._id);
      this.task.group.assignedUsers.splice(index, 1);

      this.sync();
    },
    approve () {
      let userIdToApprove = this.task.group.assignedUsers[0];
      this.$store.dispatch('tasks:approve', {
        taskId: this.task._id,
        userId: userIdToApprove,
      });
      this.task.group.assignedUsers.splice(0, 1);
      this.task.approvals.splice(0, 1);
    },
    needsWork () {
      if (!confirm(this.$t('confirmNeedsWork'))) return;
      let userIdNeedsMoreWork = this.task.group.assignedUsers[0];
      this.$store.dispatch('tasks:needsWork', {
        taskId: this.task._id,
        userId: userIdNeedsMoreWork,
      });
      this.task.approvals.splice(0, 1);
    },
    showRequests () {
      this.$root.$emit('bv::show::modal', 'approval-modal');
    },
  },
};
</script>
