<template lang="pug">
.tasks-column(:class='type')
  b-modal(ref="editTaskModal")
  buy-quest-modal(:item="selectedItemToBuy || {}",
    :priceType="selectedItemToBuy ? selectedItemToBuy.currency : ''",
    :withPin="true",
    @change="resetItemToBuy($event)"
    v-if='type === "reward"')
  .d-flex
    h2.tasks-column-title
      | {{ $t(types[type].label) }}
      .badge.badge-pill.badge-purple.column-badge(v-if="badgeCount > 0") {{ badgeCount }}
    .filters.d-flex.justify-content-end
      .filter.small-text(
        v-for="filter in types[type].filters",
        :class="{active: activeFilters[type].label === filter.label}",
        @click="activateFilter(type, filter)",
      ) {{ $t(filter.label) }}
  .tasks-list(ref="tasksWrapper")
    textarea.quick-add(
      :rows="quickAddRows",
      v-if="isUser", :placeholder="quickAddPlaceholder",
      v-model="quickAddText", @keypress.enter="quickAdd",
      ref="quickAdd",
      @focus="quickAddFocused = true", @blur="quickAddFocused = false",
    )
    transition(name="quick-add-tip-slide")
      .quick-add-tip.small-text(v-show="quickAddFocused", v-html="$t('addMultipleTip')")
    clear-completed-todos(v-if="activeFilters[type].label === 'complete2'")
    .column-background(
      v-if="isUser === true",
      :class="{'initial-description': initialColumnDescription}",
      ref="columnBackground",
    )
      .svg-icon(v-html="icons[type]", :class="`icon-${type}`", v-once)
      h3(v-once) {{$t('theseAreYourTasks', {taskType: $t(types[type].label)})}}
      .small-text {{$t(`${type}sDesc`)}}
    draggable.sortable-tasks(
      ref="tasksList",
      @update='sorted',
      :options='{disabled: activeFilters[type].label === "scheduled"}',
    )
      task(
        v-for="task in taskList",
        :key="task.id", :task="task",
        :isUser="isUser",
        @editTask="editTask",
        @moveTo="moveTo",
        :group='group',
      )
    template(v-if="hasRewardsList")
      .reward-items
        shopItem(
          v-for="reward in inAppRewards",
          :item="reward",
          :key="reward.key",
          :highlightBorder="reward.isSuggested",
          @click="openBuyDialog(reward)",
          :popoverPosition="'left'"
        )
          template(slot="itemBadge", slot-scope="ctx")
            span.badge.badge-pill.badge-item.badge-svg(
              :class="{'item-selected-badge': ctx.item.pinned, 'hide': !ctx.highlightBorder}",
              @click.prevent.stop="togglePinned(ctx.item)"
            )
              span.svg-icon.inline.icon-12.color(v-html="icons.pin")
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';


  .tasks-column {
    min-height: 556px;
  }

  .sortable-tasks + .reward-items {
    margin-top: 16px;
  }


  .reward-items {
    @supports (display: grid) {
      display: grid;
      justify-content: center;
      grid-column-gap: 16px;
      grid-row-gap: 4px;
      grid-template-columns: repeat(auto-fill, 94px);
    }

    @supports not (display: grid) {
      display: flex;
      flex-wrap: wrap;
      & > div {
        margin: 0 16px 4px 0;
      }
    }
  }

  .tasks-list {
    border-radius: 4px;
    background: $gray-600;
    padding: 8px;
    position: relative; // needed for the .bottom-gradient to be position: absolute
    height: calc(100% - 56px);
    padding-bottom: 30px;
  }

  .quick-add {
    border-radius: 2px;
    background-color: rgba($black, 0.06);
    width: 100%;
    margin-bottom: 3px;
    padding: 12px 16px;
    border-color: transparent;
    transition: background 0.15s ease-in;
    resize: none;

    &:hover {
      background-color: rgba($black, 0.1);
      border-color: transparent;
    }

    &:active, &:focus {
      background: $white;
      border-color: $purple-500;
      color: $gray-50;
      margin-bottom: 0px;
    }

    &::placeholder {
      font-weight: bold;
    }
  }

  .quick-add-tip {
    font-style: normal;
    padding: 16px;
    text-align: center;

    overflow-y: hidden;
    max-height: 65px; // approximate max height
  }

  .quick-add-tip-slide-enter-active {
    transition: all 0.5s cubic-bezier(0, 1, 0.5, 1);
  }

  .quick-add-tip-slide-leave-active {
    transition: all 0.5s cubic-bezier(0, 1, 0.5, 1);
  }

  .quick-add-tip-slide-enter, .quick-add-tip-slide-leave-to {
    max-height: 0;
    padding: 0px 16px;
  }

  .tasks-column-title {
    margin-bottom: 8px;
    position: relative;
  }

  .column-badge {
    top: -5px;
    right: -24px;
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
    color: $gray-300;
  }

  .icon-daily {
    width: 30px;
    height: 20px;
    color: $gray-300;
  }

  .icon-todo {
    width: 20px;
    height: 20px;
    color: $gray-300;
  }

  .icon-reward {
    width: 26px;
    height: 20px;
    color: $gray-300;
  }
</style>

<script>
import Task from './task';
import ClearCompletedTodos from './clearCompletedTodos';
import sortBy from 'lodash/sortBy';
import throttle from 'lodash/throttle';
import buyMixin from 'client/mixins/buy';
import { mapState, mapActions } from 'client/libs/store';
import shopItem from '../shops/shopItem';
import BuyQuestModal from 'client/components/shops/quests/buyQuestModal.vue';

import notifications from 'client/mixins/notifications';
import { shouldDo } from 'common/script/cron';
import inAppRewards from 'common/script/libs/inAppRewards';
import spells from 'common/script/content/spells';
import taskDefaults from 'common/script/libs/taskDefaults';

import svgPin from 'assets/svg/pin.svg';
import habitIcon from 'assets/svg/habit.svg';
import dailyIcon from 'assets/svg/daily.svg';
import todoIcon from 'assets/svg/todo.svg';
import rewardIcon from 'assets/svg/reward.svg';
import draggable from 'vuedraggable';

export default {
  mixins: [buyMixin, notifications],
  components: {
    Task,
    ClearCompletedTodos,
    BuyQuestModal,
    shopItem,
    draggable,
  },
  props: ['type', 'isUser', 'searchText', 'selectedTags', 'taskListOverride', 'group'], // @TODO: maybe we should store the group on state?
  data () {
    // @TODO refactor this so that filter functions aren't in data
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
          {label: 'scheduled', filter: t => !t.completed && t.date, sort: t => t.date},
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
      pin: svgPin,
    });

    let activeFilters = {};
    for (let type in types) {
      activeFilters[type] = types[type].filters.find(f => f.default === true);
    }

    return {
      types,
      activeFilters,
      icons,
      openedCompletedTodos: false,

      forceRefresh: new Date(),
      quickAddText: '',
      quickAddFocused: false,
      quickAddRows: 1,

      selectedItemToBuy: {},
    };
  },
  computed: {
    ...mapState({
      tasks: 'tasks.data',
      user: 'user.data',
      userPreferences: 'user.data.preferences',
    }),
    onUserPage () {
      let onUserPage = Boolean(this.taskList.length) && (!this.taskListOverride || this.taskListOverride.length === 0);

      if (!onUserPage) {
        this.activateFilter('daily', this.types.daily.filters[0]);
        this.types.reward.filters = [];
      }

      return onUserPage;
    },
    taskList () {
      // @TODO: This should not default to user's tasks. It should require that you pass options in
      const filter = this.activeFilters[this.type];

      let taskList = this.tasks[`${this.type}s`];
      if (this.taskListOverride) taskList = this.taskListOverride;

      if (taskList.length > 0 && ['scheduled', 'due'].indexOf(filter.label) === -1) {
        let taskListSorted = this.$store.dispatch('tasks:order', [
          taskList,
          this.user.tasksOrder,
        ]);

        taskList = taskListSorted[`${this.type}s`];
      }

      if (filter.sort) {
        taskList = sortBy(taskList, filter.sort);
      }

      return taskList.filter(t => {
        return this.filterTask(t);
      });
    },
    inAppRewards () {
      let watchRefresh = this.forceRefresh; // eslint-disable-line
      let rewards = inAppRewards(this.user);

      // Add season rewards if user is affected
      // @TODO: Add buff coniditional
      const seasonalSkills = {
        snowball: 'salt',
        spookySparkles: 'opaquePotion',
        shinySeed: 'petalFreePotion',
        seafoam: 'sand',
      };

      for (let key in seasonalSkills) {
        if (this.user.stats.buffs[key]) {
          let debuff = seasonalSkills[key];
          let item = Object.assign({}, spells.special[debuff]);
          item.text = item.text();
          item.notes = item.notes();
          item.class = `shop_${key}`;
          rewards.push(item);
        }
      }

      return rewards;
    },
    hasRewardsList () {
      return this.isUser === true && this.type === 'reward' && this.activeFilters[this.type].label !== 'custom';
    },
    initialColumnDescription () {
      // Show the column description in the middle only if there are no elements (tasks or in app items)
      if (this.hasRewardsList) {
        if (this.inAppRewards && this.inAppRewards.length >= 0) return false;
      }

      return this.tasks[`${this.type}s`].length === 0;
    },
    dailyDueDefaultView () {
      if (this.user.preferences.dailyDueDefaultView) {
        this.activateFilter('daily', this.types.daily.filters[1]);
      }

      return this.user.preferences.dailyDueDefaultView;
    },
    quickAddPlaceholder () {
      const type = this.$t(this.type);
      return this.$t('addATask', {type});
    },
    badgeCount () {
      // 0 means the badge will not be shown
      // It is shown for the all and due views of dailies
      // and for the active and scheduled views of todos.
      if (this.type === 'todo') {
        if (this.activeFilters.todo.label !== 'complete2') return this.taskList.length;
      } else if (this.type === 'daily') {
        const activeFilter = this.activeFilters.daily.label;

        if (activeFilter === 'due') {
          return this.taskList.length;
        } else if (activeFilter === 'all') {
          return this.taskList.reduce((count, t) => {
            return !t.completed && shouldDo(new Date(), t, this.userPreferences) ? count + 1 : count;
          }, 0);
        }
      }

      return 0;
    },
  },
  watch: {
    taskList: {
      handler: throttle(function setColumnBackgroundVisibility () {
        this.setColumnBackgroundVisibility();
      }, 250),
      deep: true,
    },
    dailyDueDefaultView () {
      if (!this.dailyDueDefaultView) return;
      this.activateFilter('daily', this.types.daily.filters[1]);
    },
    quickAddFocused (newValue) {
      if (newValue) this.quickAddRows = this.quickAddText.split('\n').length;
      if (!newValue) this.quickAddRows = 1;
    },
  },
  mounted () {
    this.setColumnBackgroundVisibility();

    this.$root.$on('buyModal::boughtItem', () => {
      this.forceRefresh = new Date();
    });

    if (this.type !== 'todo') return;
    this.$root.$on('habitica::resync-requested', () => {
      if (this.activeFilters.todo.label !== 'complete2') return;
      this.loadCompletedTodos(true);
    });
  },
  destroyed () {
    this.$root.$off('buyModal::boughtItem');
    if (this.type !== 'todo') return;
    this.$root.$off('habitica::resync-requested');
  },
  methods: {
    ...mapActions({
      loadCompletedTodos: 'tasks:fetchCompletedTodos',
      createTask: 'tasks:create',
    }),
    async sorted (data) {
      const filteredList = this.taskList;
      const taskToMove = filteredList[data.oldIndex];
      const taskIdToMove = taskToMove._id;
      let originTasks = this.tasks[`${this.type}s`];
      if (this.taskListOverride) originTasks = this.taskListOverride;

      // Server
      const taskIdToReplace = filteredList[data.newIndex];
      const newIndexOnServer = originTasks.findIndex(taskId => taskId === taskIdToReplace);

      let newOrder;
      if (taskToMove.group.id) {
        newOrder = await this.$store.dispatch('tasks:moveGroupTask', {
          taskId: taskIdToMove,
          position: newIndexOnServer,
        });
      } else {
        newOrder = await this.$store.dispatch('tasks:move', {
          taskId: taskIdToMove,
          position: newIndexOnServer,
        });
      }
      if (!this.taskListOverride) this.user.tasksOrder[`${this.type}s`] = newOrder;

      // Client
      const deleted = originTasks.splice(data.oldIndex, 1);
      originTasks.splice(data.newIndex, 0, deleted[0]);
    },
    async moveTo (task, where) { // where is 'top' or 'bottom'
      const taskIdToMove = task._id;
      const list = this.tasks[`${this.type}s`];

      const oldPosition = list.findIndex(t => t._id === taskIdToMove);
      const moved = list.splice(oldPosition, 1);
      const newPosition = where === 'top' ? 0 : list.length;
      list.splice(newPosition, 0, moved[0]);

      let newOrder = await this.$store.dispatch('tasks:move', {
        taskId: taskIdToMove,
        position: newPosition,
      });
      this.user.tasksOrder[`${this.type}s`] = newOrder;
    },
    quickAdd (ev) {
      // Add a new line if Shift+Enter Pressed
      if (ev.shiftKey) {
        this.quickAddRows++;
        return true;
      }

      // Do not add new line is added if only Enter is pressed
      ev.preventDefault();
      const text = this.quickAddText;
      if (!text) return false;

      const tasks = text.split('\n').reverse().filter(taskText => {
        return taskText ? true : false;
      }).map(taskText => {
        const task = taskDefaults({type: this.type, text: taskText});
        task.tags = this.selectedTags;
        return task;
      });

      this.quickAddText = null;
      this.quickAddRows = 1;
      this.createTask(tasks);
    },
    editTask (task) {
      this.$emit('editTask', task);
    },
    activateFilter (type, filter) {
      if (type === 'todo' && filter.label === 'complete2') {
        this.loadCompletedTodos();
      }

      this.activeFilters[type] = filter;
    },
    setColumnBackgroundVisibility () {
      this.$nextTick(() => {
        if (!this.$refs.columnBackground) return;

        const tasksWrapperEl = this.$refs.tasksWrapper;

        const tasksWrapperHeight = tasksWrapperEl.offsetHeight;
        const quickAddHeight = this.$refs.quickAdd ? this.$refs.quickAdd.offsetHeight : 0;
        const tasksListHeight = this.$refs.tasksList.$el.offsetHeight;

        let combinedTasksHeights = tasksListHeight + quickAddHeight;

        const rewardsList = tasksWrapperEl.getElementsByClassName('reward-items')[0];
        if (rewardsList) {
          combinedTasksHeights += rewardsList.offsetHeight;
        }

        const columnBackgroundStyle = this.$refs.columnBackground.style;

        if (tasksWrapperHeight - combinedTasksHeights < 150) {
          columnBackgroundStyle.display = 'none';
        } else {
          columnBackgroundStyle.display = 'block';
        }
      });
    },
    filterTask (task) {
      // View
      if (!this.activeFilters[task.type].filter(task)) return false;

      // Tags
      const selectedTags = this.selectedTags;

      if (selectedTags && selectedTags.length > 0) {
        const hasAllSelectedTag = selectedTags.every(tagId => {
          return task.tags.indexOf(tagId) !== -1;
        });

        if (!hasAllSelectedTag) return false;
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
      if (rewardItem.locked) return;

      // Buy armoire and health potions immediately
      let itemsToPurchaseImmediately = ['potion', 'armoire'];
      if (itemsToPurchaseImmediately.indexOf(rewardItem.key) !== -1) {
        this.makeGenericPurchase(rewardItem);
        this.$emit('buyPressed', rewardItem);
        return;
      }

      if (rewardItem.purchaseType === 'quests') {
        this.selectedItemToBuy = rewardItem;
        this.$root.$emit('bv::show::modal', 'buy-quest-modal');
        return;
      }

      if (rewardItem.purchaseType !== 'gear' || !rewardItem.locked) {
        this.$emit('openBuyDialog', rewardItem);
      }
    },
    resetItemToBuy ($event) {
      if (!$event) {
        this.selectedItemToBuy = null;
      }
    },
    togglePinned (item) {
      try {
        if (!this.$store.dispatch('user:togglePinnedItem', {type: item.pinType, path: item.path})) {
          this.text(this.$t('unpinnedItem', {item: item.text}));
        }
      } catch (e) {
        this.error(e.message);
      }
    },
  },
};
</script>
