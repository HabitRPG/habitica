<template>
  <div>
    <approval-modal :task="task" />
    <div
      v-if="!approvalRequested && !multipleApprovalsRequested"
      class="claim-bottom-message d-flex align-items-center"
    >
      <div
        class="mr-auto ml-2"
        v-html="message"
      ></div>
      <div
        v-if="!userIsAssigned"
        class="ml-auto mr-2"
      >
        <a
          class="claim-color"
          @click="claim()"
        >{{ $t('claim') }}</a>
      </div>
      <div
        v-if="userIsAssigned"
        class="ml-auto mr-2"
      >
        <a
          class="unclaim-color"
          @click="unassign()"
        >{{ $t('removeClaim') }}</a>
      </div>
    </div>
    <div
      v-if="approvalRequested && userIsManager"
      class="claim-bottom-message d-flex align-items-center justify-content-around"
    >
      <a
        class="approve-color"
        @click="approve()"
      >{{ $t('approveTask') }}</a>
      <a @click="needsWork()">{{ $t('needsWork') }}</a>
    </div>
    <div
      v-if="multipleApprovalsRequested && userIsManager"
      class="claim-bottom-message d-flex align-items-center"
    >
      <a @click="showRequests()">{{ $t('viewRequests') }}</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
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
import { mapState } from '@/libs/store';
import approvalModal from './approvalModal';
import sync from '@/mixins/sync';

export default {
  components: {
    approvalModal,
  },
  mixins: [sync],
  props: ['task', 'group'],
  computed: {
    ...mapState({ user: 'user.data' }),
    userIsAssigned () {
      return this.task.group.assignedUsers
        && this.task.group.assignedUsers.indexOf(this.user._id) !== -1;
    },
    message () {
      const { assignedUsers } = this.task.group;
      const assignedUsersNames = [];
      const assignedUsersLength = assignedUsers.length;

      // @TODO: Eh, I think we only ever display one user name
      if (this.group && this.group.members) {
        assignedUsers.forEach(userId => {
          const index = findIndex(this.group.members, member => member._id === userId);
          const assignedMember = this.group.members[index];
          assignedUsersNames.push(assignedMember.profile.name);
        });
      }

      if (assignedUsersLength === 1 && !this.userIsAssigned) {
        return this.$t('assignedToUser', { userName: assignedUsersNames[0] });
      } if (assignedUsersLength > 1 && !this.userIsAssigned) {
        return this.$t('assignedToMembers', { userCount: assignedUsersLength });
      } if (assignedUsersLength > 1 && this.userIsAssigned) {
        return this.$t('assignedToYouAndMembers', { userCount: assignedUsersLength - 1 });
      } if (this.userIsAssigned) {
        return this.$t('youAreAssigned');
      } // if (assignedUsersLength === 0) {
      return this.$t('taskIsUnassigned');
    },
    userIsManager () {
      if (
        this.group
        && (this.group.leader.id === this.user._id || this.group.managers[this.user._id])
      ) return true;
      return false;
    },
    approvalRequested () {
      if (
        (this.task.approvals && this.task.approvals.length === 1)
        || (this.task.group && this.task.group.approval && this.task.group.approval.requested)
      ) {
        return true;
      }
      return false;
    },
    multipleApprovalsRequested () {
      if (this.task.approvals && this.task.approvals.length > 1) return true;
      return false;
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
      if (!window.confirm(this.$t('confirmUnClaim'))) return;

      let taskId = this.task._id;
      // If we are on the user task
      if (this.task.userId) {
        taskId = this.task.group.taskId;
      }

      await this.$store.dispatch('tasks:unassignTask', {
        taskId,
        userId: this.user._id,
      });
      const index = this.task.group.assignedUsers.indexOf(this.user._id);
      this.task.group.assignedUsers.splice(index, 1);

      this.sync();
    },
    approve () {
      const userIdToApprove = this.task.group.assignedUsers[0];
      this.$store.dispatch('tasks:approve', {
        taskId: this.task._id,
        userId: userIdToApprove,
      });
      this.task.group.assignedUsers.splice(0, 1);
      this.task.approvals.splice(0, 1);
    },
    needsWork () {
      if (!window.confirm(this.$t('confirmNeedsWork'))) return;
      const userIdNeedsMoreWork = this.task.group.assignedUsers[0];
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
