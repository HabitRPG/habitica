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
      <div
        class="ml-auto mr-2 text-right gray-100"
        v-if="task.group.assignedUsers"
      >
        <span
          v-if="completionsCount"
          class="mr-1"
        >
          {{ completionsCount }}/{{ assignedUsersCount }}
        </span>
        <a
          v-if="!showStatus"
          class="blue-10"
          @click="showStatus = !showStatus"
        >
          {{ $t('viewStatus') }}
        </a>
        <a
          v-if="showStatus"
          @click="showStatus = !showStatus"
        >
          {{ $t('close') }}
        </a>
      </div>
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

    .blue-10 {
      color: $blue-10;
    }
    .gray-100 {
      color: $gray-100;
    }
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
import reduce from 'lodash/reduce';
import { mapState } from '@/libs/store';
import approvalModal from './approvalModal';
import sync from '@/mixins/sync';

export default {
  components: {
    approvalModal,
  },
  mixins: [sync],
  props: ['task', 'group'],
  data () {
    return {
      showStatus: false,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    userIsAssigned () {
      return this.task.group.assignedUsers
        && Boolean(this.task.group.assignedUsers[this.user._id]);
    },
    assignedUsersKeys () {
      return keys(this.task.group.assignedUsers);
    },
    assignedUsersCount () {
      return this.assignedUsersKeys.length;
    },
    completionsCount () {
      return reduce(this.task.group.assignedUsers, (count, assignment) => {
        if (assignment.completed) return count + 1;
        return count;
      }, 0);
    },
    message () {
      if (this.assignedUsersCount === 1 && !this.userIsAssigned) {
        const index = findIndex(
          this.group.members, member => member._id === this.assignedUsersKeys[0],
        );
        const userName = this.group.members[index].auth.local.username;
        return this.$t('assignedToUser', { userName });
      } if (this.assignedUsersCount > 1 && !this.userIsAssigned) {
        return this.$t('assignedToMembers', { userCount: this.assignedUsersCount });
      } if (this.assignedUsersCount > 1 && this.userIsAssigned) {
        return this.$t('assignedToYouAndMembers', { userCount: this.assignedUsersCount - 1 });
      } if (this.userIsAssigned) {
        return this.$t('youAreAssigned');
      } // Task is open; we shouldn't be showing message at all
      return this.$t('error');
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
