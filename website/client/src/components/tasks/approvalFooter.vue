<template>
  <div>
    <approval-modal :task="task" />
    <div
      class="claim-bottom-message d-flex align-items-center"
    >
      <div
        class="mr-auto ml-2"
        v-html="message"
      ></div>
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
import keys from 'lodash/keys';
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
        && Boolean(this.task.group.assignedUsers[this.user._id]);
    },
    message () {
      const { assignedUsers } = this.task.group;
      const assignedUsersKeys = keys(assignedUsers);
      const assignedUsersNames = [];
      const assignedUsersLength = assignedUsersKeys.length;

      // @TODO: Eh, I think we only ever display one user name
      if (this.group && this.group.members) {
        assignedUsersKeys.forEach(userId => {
          const index = findIndex(this.group.members, member => member._id === userId);
          const assignedMember = this.group.members[index];
          assignedUsersNames.push(`@${assignedMember.auth.local.username}`);
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
  },
};
</script>
