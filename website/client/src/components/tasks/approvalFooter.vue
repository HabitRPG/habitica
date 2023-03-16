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
        class="d-flex completion-row"
      >
        <div class="control">
          <div
            class="inner d-flex justify-content-center align-items-center p-auto"
            :class="{interactive: iconClass(completion) !== 'lock'}"
            @click="iconClass(completion) !== 'lock' ? needsWork(completion) : null"
          >
            <div
              class="icon"
              :class="iconClass(completion)"
              v-html="icons[iconClass(completion)]"
            >
            </div>
          </div>
        </div>
        <div
          class="px-75 py-2 info"
        >
          <div>
            <strong> @{{ completion.userName }} </strong>
          </div>
          <div
            v-if='completion.completedDate'
            :class="{'green-10': completion.completed}"
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
        v-if="assignedUsersCount > 0"
        class="svg-icon ml-2 users-icon color"
        :class="{'green-10': completionsCount === assignedUsersCount}"
        v-html="icons.users"
      ></div>
      <div
        class="mr-auto ml-1 my-auto"
        :class="{'green-10': completionsCount === assignedUsersCount}"
        v-html="message"
      ></div>
      <div
        class="d-flex ml-auto mr-1 my-auto"
        v-if="task.group.assignedUsers && ['daily','todo'].indexOf(task.type) !== -1"
      >
        <span
          v-if="assignedUsersCount > 1"
          class="d-flex mr-1 my-auto"
        >
          <span
            class="small-check"
            v-if="!showStatus && completionsCount"
          >
            <div
              class="svg-icon color"
              :class="{'green-10': completionsCount === assignedUsersCount}"
              v-html="icons.check"
            >
            </div>
          </span>
          <span
            class="ml-1 mr-2 my-auto"
            :class="{'green-10': completionsCount === assignedUsersCount}"
            v-if="!showStatus && completionsCount"
          >
            {{ completionsCount }}/{{ assignedUsersCount }}
          </span>
          <a
            v-if="assignedUsersCount > 1 && !showStatus"
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
        </span>
        <span
          v-if="assignedUsersCount === 1 && task.type === 'daily'
            && !task.completed && singleAssignLastDone"
          class="mr-1 d-inline-flex"
        >
          <span
            v-html="icons.lastComplete"
            v-b-tooltip.hover.bottom="$t('lastCompleted')"
            class="svg-icon color last-completed mr-1 my-auto"
            :class="{'gray-200': completionsCount !== assignedUsersCount}"
          >
          </span>
          <span
            :class="{'green-10': completionsCount === assignedUsersCount}"
          >
            {{ formattedCompletionTime }}
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  .claim-bottom-message {
    background-color: $gray-600;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    font-size: 12px;
    line-height: 1.334;
    padding-bottom: 0.25rem;
    padding-top: 0.25rem;
    z-index: 9;
    height: 24px;
  }

  .completion-row {
    height: 3rem;
    background-color: $gray-700;
    font-size: 12px;

    .control {
      background-color: $gray-200;
      border-top: 1px solid $gray-100;
      width: 40px;
      height: 48px;
      padding: 9px 6px;

      .inner {
        width: 28px;
        height: 28px;
        padding: 6px;
        border-radius: 2px;
        background-color: rgba($white, 0.5);
        cursor: default;

        &.interactive {
          cursor: pointer;

          &:hover {
            background-color: rgba($white, 0.75);
          }
        }

        .icon {
          color: $gray-10;

          &.lock {
            width: 10px;
          }
          &.check {
            margin-left: 2px;
            width: 12px;
          }
        }
      }
    }

    .info {
      width: 100%;
      border-top: 1px solid $gray-600;
    }
  }

  .gray-100 {
    color: $gray-100;
  }
  .green-10 {
    color: $green-10;
  }

  .last-completed {
    width: 16px;
    height: 14px;
    margin-bottom: 4px;
  }

  .small-check {
    display: inline-flex;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    background-color: $gray-500;

    .svg-icon {
      width: 8px;
      height: 6px;
      margin: auto;
    }
  }

  .users-icon {
    width: 16px;
  }
</style>

<script>
import moment from 'moment';
import reduce from 'lodash/reduce';
import { mapState } from '@/libs/store';
import checkIcon from '@/assets/svg/check.svg';
import lockIcon from '@/assets/svg/lock.svg';
import usersIcon from '@/assets/svg/users.svg';
import lastComplete from '@/assets/svg/last-complete.svg';

export default {
  props: ['task', 'group'],
  data () {
    return {
      showStatus: false,
      icons: Object.freeze({
        check: checkIcon,
        lastComplete,
        lock: lockIcon,
        users: usersIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    userIsAssigned () {
      return this.task.group.assignedUsersDetail
        && Boolean(this.task.group.assignedUsersDetail[this.user._id]);
    },
    userIsManager () {
      return this.group
      && (this.group.leader.id === this.user._id || this.group.managers[this.user._id]);
    },
    assignedUsersCount () {
      return this.task.group.assignedUsers.length;
    },
    completionsCount () {
      return reduce(this.task.group.assignedUsersDetail, (count, assignment) => {
        if (assignment.completed) return count + 1;
        return count;
      }, 0);
    },
    completionsList () {
      if (this.assignedUsersCount === 1) return [];
      const completionsArray = [];
      for (const userId of this.task.group.assignedUsers) {
        if (userId !== this.user._id) {
          const { completedDate } = this.task.group.assignedUsersDetail[userId];
          let completedDateString;
          if (moment().diff(completedDate, 'days') > 0) {
            completedDateString = `Completed ${moment(completedDate).format('M/D/YY')}`;
          } else {
            completedDateString = `Completed at ${moment(completedDate).format('h:mm A')}`;
          }
          completionsArray.push({
            userId,
            userName: this.task.group.assignedUsersDetail[userId].assignedUsername,
            completed: this.task.group.assignedUsersDetail[userId].completed,
            completedDate,
            completedDateString,
          });
        }
      }
      return completionsArray;
    },
    message () {
      if (this.assignedUsersCount > 1) { // Multi assigned
        if (this.userIsAssigned) {
          return this.$t('assignedToYouAndMembers', { userCount: this.assignedUsersCount - 1 });
        }
        return this.$t('assignedToMembers', { userCount: this.assignedUsersCount });
      }
      if (this.assignedUsersCount === 1) { // Singly assigned
        const userId = this.task.group.assignedUsers[0];
        const userName = this.task.group.assignedUsersDetail[userId].assignedUsername;

        if (this.task.group.assignedUsersDetail[userId].completed) { // completed
          const { completedDate } = this.task.group.assignedUsersDetail[userId];
          if (this.userIsAssigned) {
            if (moment().diff(completedDate, 'days') > 0) {
              return `<strong>You</strong> completed ${moment(completedDate).format('M/D/YY')}`;
            }
            return `<strong>You</strong> completed at ${moment(completedDate).format('h:mm A')}`;
          }
          if (moment().diff(completedDate, 'days') > 0) {
            return `@${userName} completed ${moment(completedDate).format('M/D/YY')}`;
          }
          return `@${userName} completed at ${moment(completedDate).format('h:mm A')}`;
        }
        if (this.userIsAssigned) {
          return this.$t('youEmphasized');
        }
        return `@${userName}`;
      }
      return this.$t('error'); // task is open, or the other conditions aren't hitting right
    },
    singleAssignLastDone () {
      const completion = this.task?.group?.assignedUsersDetail[this.user._id];
      if (completion) return completion.completedDate;
      return null;
    },
    formattedCompletionTime () {
      if (!this.singleAssignLastDone) return '';
      if (moment().diff(this.singleAssignLastDone, 'days') < 1) {
        return moment(this.singleAssignLastDone).format('h:mm A');
      }
      return moment(this.singleAssignLastDone).format('M/D/YY');
    },
  },
  methods: {
    iconClass (completion) {
      if (this.userIsManager && completion.completed) return 'check';
      return 'lock';
    },
    needsWork (completion) {
      this.$store.dispatch('tasks:needsWork', {
        taskId: this.task._id,
        userId: completion.userId,
      });
      this.task.group.assignedUsersDetail[completion.userId].completed = false;
    },
  },
};
</script>
