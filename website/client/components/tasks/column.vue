<template lang="pug">
.tasks-column
  .d-flex
    h2.tasks-column-title(v-once) {{ $t(types[type].label) }}
    .filters.d-flex.justify-content-end
      .filter.small-text(
        v-for="filter in types[type].filters",
        :class="{active: activeFilter.label === filter.label}",
        @click="activeFilter = filter",
      ) {{ $t(filter.label) }}
  .tasks-list
    task(v-for="task in tasks[`${type}s`]", :key="task.id", :task="task", v-if="activeFilter.filter(task)")
    .bottom-gradient
    .column-background(v-if="isUser === true", :class="{'initial-description': tasks[`${type}s`].length === 0}")
      .svg-icon(v-html="icons[type]", :class="`icon-${type}`", v-once)
      h3(v-once) {{$t('theseAreYourTasks', {taskType: `${type}s`})}}
      .small-text {{$t(`${type}sDesc`)}}
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.tasks-column {
  flex-grow: 1;
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
}

.icon-daily {
  width: 30px;
  height: 20px;
}

.icon-todo {
  width: 20px;
  height: 20px;
}

.icon-reward {
  width: 26px;
  height: 20px;
}
</style>

<script>
import Task from './task';
import { mapState } from 'client/libs/store';
import { shouldDo } from 'common/script/cron';
import habitIcon from 'assets/svg/habit.svg';
import dailyIcon from 'assets/svg/daily.svg';
import todoIcon from 'assets/svg/todo.svg';
import rewardIcon from 'assets/svg/reward.svg';

export default {
  components: {
    Task,
  },
  props: ['type', 'isUser'],
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
    };
  },
  computed: {
    ...mapState({
      tasks: 'tasks.data',
      userPreferences: 'user.data.preferences',
    }),
  },
};
</script>
