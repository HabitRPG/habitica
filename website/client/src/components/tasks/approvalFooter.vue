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
          class="px-3 py-2 info"
        >
          <div>
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
        :class="{'green-10': showGreen}"
        v-html="message"
      ></div>
      <div
        class="ml-auto mr-2 text-right"
        v-if="task.group.assignedUsers"
      >
        <span
          v-if="assignedUsersCount > 1 && completionsCount"
          class="mr-1 d-inline-flex align-items-center"
        >
          <span
            class="small-check my-auto"
            v-if="!showStatus"
            :class="{'green-50': completionsCount === assignedUsersCount}"
            v-html="icons.check"
          ></span>
          <span
            class="my-auto ml-1 mr-2"
            v-if="!showStatus"
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
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .small-check {
    display: inline-flex;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    padding-left: 2px;
    background-color: #e1e0e3;

    svg {
      margin: auto;
      width: 8px;

      path {
        fill: #878190;
      }
    }

    &.green-50 svg path {
      fill: #20b780;
    }
  }
</style>

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
</style>

<script>
import findIndex from 'lodash/findIndex';
import keys from 'lodash/keys';
import moment from 'moment';
import reduce from 'lodash/reduce';
import { mapState } from '@/libs/store';
import checkIcon from '@/assets/svg/check.svg';
import lockIcon from '@/assets/svg/lock.svg';

export default {
  props: ['task', 'group'],
  data () {
    return {
      showStatus: false,
      icons: Object.freeze({
        check: checkIcon,
        lock: lockIcon,
      }),
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
          if (!completedDate) return [];
          let completedDateString;
          if (moment().diff(completedDate, 'days') > 0) {
            completedDateString = `Completed ${moment(completedDate).format('M/D/YY')}`;
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
      if (this.assignedUsersCount > 1) { // Multi assigned
        if (this.userIsAssigned) {
          return this.$t('assignedToYouAndMembers', { userCount: this.assignedUsersCount - 1 });
        }
        return this.$t('assignedToMembers', { userCount: this.assignedUsersCount });
      }
      if (this.assignedUsersCount === 1) { // Singly assigned
        const userId = this.assignedUsersKeys[0];
        const index = findIndex(
          this.group.members, member => member._id === userId,
        );
        const userName = this.group.members[index].auth.local.username;

        if (this.task.group.assignedUsers[userId].completed) { // completed
          const { completedDate } = this.task.group.assignedUsers[userId];
          if (this.userIsAssigned) {
            if (moment().diff(completedDate, 'days') > 0) {
              return `<strong>You</strong> completed ${moment(completedDate).format('M/D/YY')}`;
            }
            return `<strong>You</strong> completed today at ${moment(completedDate).format('h:mm A')}`;
          }
          if (moment().diff(completedDate, 'days') > 0) {
            return `<strong>@${userName}</strong> completed ${moment(completedDate).format('M/D/YY')}`;
          }
          return `<strong>@${userName}</strong> completed today at ${moment(completedDate).format('h:mm A')}`;
        }
        if (this.userIsAssigned) {
          return this.$t('youAreAssigned');
        }
        return this.$t('assignedToUser', { userName });
      }
      return this.$t('error'); // task is open, or the other conditions aren't hitting right
    },
    showGreen () {
      if (this.assignedUsersCount !== 1) return false;
      const userId = this.assignedUsersKeys[0];
      const completion = this.task.group.assignedUsers[userId];
      return completion.completed && moment().diff(completion.completedDate, 'days') < 1;
    },
  },
  methods: {
    iconClass (completion) {
      if ((this.userIsAssigned || this.userIsManager) && completion.completed) return 'check';
      return 'lock';
    },
    needsWork (completion) {
      this.$store.dispatch('tasks:needsWork', {
        taskId: this.task._id,
        userId: completion.userId,
      });
      this.task.group.assignedUsers[completion.userId].completed = false;
    },
  },
};
</script>
