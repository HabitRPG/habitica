<template>
  <div
    class="gray-100"
  >
    <div
      v-if="showStatus"
    >
      <div
        v-for="completion in completionsList"
        :key="completion.userId"
        class="completion-row"
      >
        <div
          class="px-3 py-2"
        >
          <div>
            <span v-if="completion.completed">✅</span>
            <span v-else>❎</span>
            <strong> @{{ completion.userName }} </strong>
          </div>
          <div
            v-if='completion.completedDate'
            :class="{'green-10': completion.completedToday}"
          >
            {{ completion.completedDateString }}
          </div>
        </div>
      </div>
    </div>
    <div
      class="claim-bottom-message d-flex align-items-center"
    >
      <div
        class="mr-auto ml-2"
        v-html="message"
      ></div>
      <div
        class="ml-auto mr-2 text-right"
        v-if="task.group.assignedUsers"
      >
        <span
          v-if="assignedUsersCount > 1 && completionsCount && !showStatus"
          class="mr-1"
        >
          {{ completionsCount }}/{{ assignedUsersCount }}
        </span>
        <a
          v-if="assignedUsersCount > 1 && !showStatus"
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
    background-color: $gray-600;
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
    font-size: 12px;
    padding-bottom: 0.25rem;
    padding-top: 0.25rem;
    z-index: 9;

    .blue-10 {
      color: $blue-10;
    }
  }
  .completion-row {
    height: 3rem;
    background-color: $gray-700;
    font-size: 12px;

    &:not(:last-of-type) {
      border-bottom: 1px solid $gray-500;
    }

    .green-10 {
      color: $green-10;
    }
  }
  .gray-100 {
    color: $gray-100;
  }
</style>

<script>
import findIndex from 'lodash/findIndex';
import keys from 'lodash/keys';
import moment from 'moment';
import reduce from 'lodash/reduce';
import { mapState } from '@/libs/store';

export default {
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
    userIsManager () {
      return this.group
      && (this.group.leader.id === this.user._id || this.group.managers[this.user._id]);
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
    completionsList () {
      if (this.assignedUsersCount === 1) return [];
      const completionsArray = [];
      for (const userId of this.assignedUsersKeys) {
        if (userId !== this.user._id) {
          const index = findIndex(this.group.members, member => member._id === userId);
          const { completedDate } = this.task.group.assignedUsers[userId];
          let completedDateString;
          if (completedDate && moment().diff(completedDate, 'days') > 0) {
            completedDateString = `Last completed ${moment(completedDate).format('M/D/YY')}`;
          } else {
            completedDateString = `Completed today at ${moment(completedDate).format('h:mm A')}`;
          }
          completionsArray.push({
            userId,
            userName: this.group.members[index].auth.local.username,
            completed: this.task.group.assignedUsers[userId].completed,
            completedDate,
            completedDateString,
            completedToday: moment().diff(completedDate, 'days') === 0,
          });
        }
      }
      return completionsArray;
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
  },
};
</script>
