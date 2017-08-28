<template lang="pug">
.tasks-column(:class='type')
  b-modal(ref="editTaskModal")
  .d-flex
    h2.tasks-column-title(v-once) {{ $t(types[type].label) }}
    .filters.d-flex.justify-content-end
      .filter.small-text(
        v-for="filter in types[type].filters",
        :class="{active: activeFilter.label === filter.label}",
        @click="activateFilter(type, filter)",
      ) {{ $t(filter.label) }}
  .tasks-list(ref="taskList")
    task(
      v-for="task in taskList",
      :key="task.id", :task="task",
      v-if="filterTask(task)",
      :isUser="isUser",
      @editTask="editTask",
      :group='group',
    )
    template(v-if="isUser === true && type === 'reward' && activeFilter.label !== 'custom'")
      .reward-items
        shopItem(
          v-for="reward in inAppRewards",
          :item="reward",
          :key="reward.key",
          :highlightBorder="reward.isSuggested",
          @click="openBuyDialog(reward)",
          :popoverPosition="'left'"
        )

    .column-background(
      v-if="isUser === true",
      :class="{'initial-description': tasks[`${type}s`].length === 0}",
      ref="columnBackground",
    )
      .svg-icon(v-html="icons[type]", :class="`icon-${type}`", v-once)
      h3(v-once) {{$t('theseAreYourTasks', {taskType: $t(types[type].label)})}}
      .small-text {{$t(`${type}sDesc`)}}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .tasks-column {
    height: 556px;
  }

  .task + .reward-items {
    margin-top: 16px;
  }

  .reward-items {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .tasks-list {
    border-radius: 4px;
    background: $gray-600;
    padding: 8px;
    // not sure why but this is necessary or the last task will overflow the container
    padding-bottom: 0.1px;
    position: relative;
    height: calc(100% - 64px);
    overflow: auto;
  }

  .bottom-gradient {
    position: absolute;
    bottom: 0px;
    left: 0px;
    height: 42px;
    background-image: linear-gradient(to bottom, rgba($gray-10, 0), rgba($gray-10, 0.24));
    width: 100%;
    z-index: 99;
  }

  .tasks-column-title {
    margin-bottom: 8px;
  }

  .filters {
    flex-grow: 1;
  }

  .filter {
    font-weight: bold;
    color: $gray-100;
    font-style: normal;
    padding: 8px;
    cursor: pointer;

    &:hover {
      color: $purple-200;
    }

    &.active {
      color: $purple-200;
      border-bottom: 2px solid $purple-200;
      padding-bottom: 6px;
    }
  }

  .column-background {
    position: absolute;
    bottom: 32px;
    z-index: 7;

    &.initial-description {
      top: 30%;
    }

    .svg-icon {
      margin: 0 auto;
      margin-bottom: 12px;
    }

    h3, .small-text {
      color: $gray-300;
      text-align: center;
    }

    h3 {
      font-weight: normal;
      margin-bottom: 4px;
    }

    .small-text {
      font-style: normal;
      padding-left: 24px;
      padding-right: 24px;
    }
  }

  .icon-habit {
    width: 30px;
    height: 20px;
    color: #A5A1AC;
  }

  .icon-daily {
    width: 30px;
    height: 20px;
    color: #A5A1AC;
  }

  .icon-todo {
    width: 20px;
    height: 20px;
    color: #A5A1AC;
  }

  .icon-reward {
    width: 26px;
    height: 20px;
    color: #A5A1AC;
  }
</style>

<script>
import Task from './task';
import { mapState, mapActions } from 'client/libs/store';
import { shouldDo } from 'common/script/cron';
import inAppRewards from 'common/script/libs/inAppRewards';
import habitIcon from 'assets/svg/habit.svg';
import dailyIcon from 'assets/svg/daily.svg';
import todoIcon from 'assets/svg/todo.svg';
import rewardIcon from 'assets/svg/reward.svg';
import bModal from 'bootstrap-vue/lib/components/modal';
import shopItem from '../shops/shopItem';
import throttle from 'lodash/throttle';

export default {
  components: {
    Task,
    bModal,
    shopItem,
  },
  props: ['type', 'isUser', 'searchText', 'selectedTags', 'taskListOverride', 'group'], // @TODO: maybe we should store the group on state?
  data () {
    const types = Object.freeze({
      habit: {
        label: 'habits',
        filters: [
          {label: 'all', filter: () => true, default: true},
          {label: 'yellowred', filter: t => t.value < 1}, // weak
          {label: 'greenblue', filter: t => t.value >= 1}, // strong
        ],
      },
      daily: {
        label: 'dailies',
        filters: [
          {label: 'all', filter: () => true, default: true},
          {label: 'due', filter: t => !t.completed && shouldDo(new Date(), t, this.userPreferences)},
          {label: 'notDue', filter: t => t.completed || !shouldDo(new Date(), t, this.userPreferences)},
        ],
      },
      todo: {
        label: 'todos',
        filters: [
          {label: 'remaining', filter: t => !t.completed, default: true}, // active
          {label: 'scheduled', filter: t => !t.completed && t.date},
          {label: 'complete2', filter: t => t.completed},
        ],
      },
      reward: {
        label: 'rewards',
        filters: [
          {label: 'all', filter: () => true, default: true},
          {label: 'custom', filter: () => true}, // all rewards made by the user
          {label: 'wishlist', filter: () => false}, // not user tasks
        ],
      },
    });

    const icons = Object.freeze({
      habit: habitIcon,
      daily: dailyIcon,
      todo: todoIcon,
      reward: rewardIcon,
    });

    return {
      types,
      activeFilter: types[this.type].filters.find(f => f.default === true),
      icons,
      openedCompletedTodos: false,
    };
  },
  computed: {
    ...mapState({
      tasks: 'tasks.data',
      user: 'user.data',
      userPreferences: 'user.data.preferences',
    }),
    taskList () {
      // @TODO: This should not default to user's tasks. It should require that you pass options in
      if (this.taskListOverride) return this.taskListOverride;
      return this.tasks[`${this.type}s`];
    },
    inAppRewards () {
      return inAppRewards(this.user);
    },
  },
  watch: {
    taskList: {
      handler: throttle(function setColumnBackgroundVisibility () {
        this.setColumnBackgroundVisibility();
      }, 250),
      deep: true,
    },
  },
  mounted () {
    this.setColumnBackgroundVisibility();
  },
  methods: {
    ...mapActions({loadCompletedTodos: 'tasks:fetchCompletedTodos'}),
    editTask (task) {
      this.$emit('editTask', task);
    },
    activateFilter (type, filter) {
      if (type === 'todo' && filter.label === 'complete2') {
        this.loadCompletedTodos();
      }
      this.activeFilter = filter;
    },
    setColumnBackgroundVisibility () {
      this.$nextTick(() => {
        const taskListEl = this.$refs.taskList;
        const tasklistHeight = taskListEl.offsetHeight;
        let combinedTasksHeights = 0;
        Array.from(taskListEl.getElementsByClassName('task')).forEach(el => {
          combinedTasksHeights += el.offsetHeight;
        });

        if (!this.$refs.columnBackground) return;

        const rewardsList = taskListEl.getElementsByClassName('reward-items')[0];
        if (rewardsList) {
          combinedTasksHeights += rewardsList.offsetHeight;
        }

        const columnBackgroundStyle = this.$refs.columnBackground.style;

        if (tasklistHeight - combinedTasksHeights < 150) {
          columnBackgroundStyle.display = 'none';
        } else {
          columnBackgroundStyle.display = 'block';
        }
      });
    },
    filterTask (task) {
      // View
      if (!this.activeFilter.filter(task)) return false;

      // Tags
      const selectedTags = this.selectedTags;

      if (selectedTags && selectedTags.length > 0) {
        const hasSelectedTag = task.tags.find(tagId => {
          return selectedTags.indexOf(tagId) !== -1;
        });

        if (!hasSelectedTag) return false;
      }

      // Text
      const searchText = this.searchText;

      if (!searchText) return true;
      if (task.text.toLowerCase().indexOf(searchText) !== -1) return true;
      if (task.notes.toLowerCase().indexOf(searchText) !== -1) return true;

      if (task.checklist && task.checklist.length) {
        const checklistItemIndex = task.checklist.findIndex(({text}) => {
          return text.toLowerCase().indexOf(searchText) !== -1;
        });

        return checklistItemIndex !== -1;
      }
    },
    openBuyDialog (rewardItem) {
      if (rewardItem.purchaseType !== 'gear' || !rewardItem.locked) {
        this.$emit('openBuyDialog', rewardItem);
      }
    },
  },
};
</script>
