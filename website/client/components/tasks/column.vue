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
  background-image: linear-gradient(to bottom, rgba(52, 49, 58, 0), #34313a);
}

.bottom-gradient {
  display: none;
  position: absolute;
  bottom: 0px;
  left: -0px;
  height: 42px;
  background-image: linear-gradient(to bottom, rgba(52, 49, 58, 0), #34313a);
  width: 100%;
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
</style>

<script>
import Task from './task';
import { mapState } from 'client/libs/store';
import { shouldDo } from 'common/script/cron';

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

    return {
      types,
      activeFilter: types[this.type].filters.find(f => f.default === true),
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
