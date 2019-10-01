<template lang="pug">
div
  approval-modal(:task='task')
  .claim-bottom-message.d-flex.align-items-center(v-if='!approvalRequested && !multipleApprovalsRequested')
    .mr-auto.ml-2(v-html='message')
    .ml-auto.mr-2(v-if='!userIsAssigned')
      a(@click='claim()').claim-color {{ $t('claim') }}
    .ml-auto.mr-2(v-if='userIsAssigned')
      a(@click='unassign()').unclaim-color {{ $t('removeClaim') }}
  .claim-bottom-message.d-flex.align-items-center.justify-content-around(v-if='approvalRequested && userIsManager')
    a(@click='approve()').approve-color {{ $t('approveTask') }}
    a(@click='needsWork()') {{ $t('needsWork') }}
  .claim-bottom-message.d-flex.align-items-center(v-if='multipleApprovalsRequested && userIsManager')
    a(@click='showRequests()') {{ $t('viewRequests') }}
</template>

<style lang="scss", scoped>
  @import '~client/assets/scss/colors.scss';
  .claim-bottom-message {
    background-color: $gray-700;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    color: $gray-200;
    font-size: 12px;
    padding-bottom: 0.25rem;
    padding-top: 0.25rem;
    z-index: 9;
  }

  .approve-color {
    color: $green-10 !important;
  }
  .claim-color {
    color: $blue-10 !important;
  }
  .unclaim-color {
    color: $red-50 !important;
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
    userIsManager () {
      if (this.group && (this.group.leader.id === this.user._id || this.group.managers[this.user._id])) return true;
    },
    approvalRequested () {
      if (this.task.approvals && this.task.approvals.length === 1 || this.task.group && this.task.group.approval && this.task.group.approval.requested) return true;
    },
    multipleApprovalsRequested () {
      if (this.task.approvals && this.task.approvals.length > 1) return true;
    },
  },
  methods: {
    async claim () {
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
