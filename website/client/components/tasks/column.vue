<template lang="pug">
.tasks-column(:class='type')
  b-modal(ref="editTaskModal")
  buy-quest-modal(:item="selectedItemToBuy || {}",
    :priceType="selectedItemToBuy ? selectedItemToBuy.currency : ''",
    :withPin="true",
    @change="resetItemToBuy($event)"
    v-if='type === "reward"')
  .d-flex.align-items-center
    h2.column-title {{ $t(typeLabel) }}
    .badge.badge-pill.badge-purple.column-badge.mx-1(v-if="badgeCount > 0") {{ badgeCount }}
    .filters.d-flex.justify-content-end
      .filter.small-text(
        v-for="filter in typeFilters",
        :class="{active: activeFilter.label === filter}",
        @click="activateFilter(type, filter)",
      ) {{ $t(filter) }}
  .tasks-list(ref="tasksWrapper")
    textarea.quick-add(
      :rows="quickAddRows",
      v-if="isUser", :placeholder="quickAddPlaceholder",
      v-model="quickAddText", @keypress.enter="quickAdd",
      ref="quickAdd",
      @focus="quickAddFocused = true", @blur="quickAddFocused = false",
    )
    transition(name="quick-add-tip-slide")
      .quick-add-tip.small-text(v-show="quickAddFocused", v-html="$t('addMultipleTip', {taskType: $t(typeLabel)})")
    clear-completed-todos(v-if="activeFilter.label === 'complete2' && isUser === true")
    .column-background(
      v-if="isUser === true",
      :class="{'initial-description': initialColumnDescription}",
      ref="columnBackground",
    )
      .svg-icon(v-html="icons[type]", :class="`icon-${type}`", v-once)
      h3(v-once) {{$t('theseAreYourTasks', {taskType: $t(typeLabel)})}}
      .small-text {{$t(`${type}sDesc`)}}
    draggable.sortable-tasks(
      ref="tasksList",
      @update='taskSorted',
      @start="isDragging(true)",
      @end="isDragging(false)",
      :options='{disabled: activeFilter.label === "scheduled" || !isUser, scrollSensitivity: 64}',
    )
      task(
        v-for="task in taskList",
        :key="task.id", :task="task",
        :isUser="isUser",
        @editTask="editTask",
        @moveTo="moveTo",
        :group='group',
        v-on:taskDestroyed='taskDestroyed'
      )
    template(v-if="hasRewardsList")
      draggable.reward-items(
        ref="rewardsList",
        @update="rewardSorted",
        @start="rewardDragStart",
        @end="rewardDragEnd",
      )
        shopItem(
          v-for="reward in inAppRewards",
          :item="reward",
          :key="reward.key",
          :highlightBorder="reward.isSuggested",
          :showPopover="showPopovers"
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

  /deep/ .draggable-cursor {
    cursor: grabbing;
  }

  .tasks-column {
    min-height: 556px;
  }

  .sortable-tasks {
    word-break: break-word;
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
    padding: 0 16px;
  }

  .column-title {
    margin-bottom: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .column-badge {
    position: static;
  }

  .filters {
    margin-left: auto;
  }

  .filter {
    font-weight: bold;
    color: $gray-100;
    font-style: normal;
    padding: 8px;
    cursor: pointer;
    white-space: nowrap;

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
    width: 100%;
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
import throttle from 'lodash/throttle';
import isEmpty from 'lodash/isEmpty';
import buyMixin from 'client/mixins/buy';
import { mapState, mapActions, mapGetters } from 'client/libs/store';
import shopItem from '../shops/shopItem';
import BuyQuestModal from 'client/components/shops/quests/buyQuestModal.vue';

import notifications from 'client/mixins/notifications';
import { shouldDo } from 'common/script/cron';
import inAppRewards from 'common/script/libs/inAppRewards';
import spells from 'common/script/content/spells';
import taskDefaults from 'common/script/libs/taskDefaults';

import {
  getTypeLabel,
  getFilterLabels,
  getActiveFilter,
} from 'client/libs/store/helpers/filterTasks.js';

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
  // Set default values for props
  // allows for better control of props values
  // allows for better control of where this component is called
  props: {
    type: {},
    isUser: {
      type: Boolean,
      default: false,
    },
    searchText: {},
    selectedTags: {},
    taskListOverride: {},
    group: {},
  }, // @TODO: maybe we should store the group on state?
  data () {
    const icons = Object.freeze({
      habit: habitIcon,
      daily: dailyIcon,
      todo: todoIcon,
      reward: rewardIcon,
      pin: svgPin,
    });

    let typeLabel = '';
    let typeFilters = [];
    let activeFilter = {};

    return {
      typeLabel,
      typeFilters,
      activeFilter,

      icons,
      openedCompletedTodos: false,

      forceRefresh: new Date(),
      quickAddText: '',
      quickAddFocused: false,
      quickAddRows: 1,
      showPopovers: true,

      selectedItemToBuy: {},
      dragging: false,
    };
  },
  created () {
    // Set Task Column Label
    this.typeLabel = getTypeLabel(this.type);
    // Get Category Filter Labels
    this.typeFilters = getFilterLabels(this.type);
    // Set default filter for task column
    this.activateFilter(this.type);
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
    ...mapGetters({
      getFilteredTaskList: 'tasks:getFilteredTaskList',
      getUnfilteredTaskList: 'tasks:getUnfilteredTaskList',
      getUserPreferences: 'user:preferences',
      getUserBuffs: 'user:buffs',
    }),
    taskList () {
      // @TODO: This should not default to user's tasks. It should require that you pass options in
      let filteredTaskList = this.isUser ?
        this.getFilteredTaskList({
          type: this.type,
          filterType: this.activeFilter.label,
        }) :
        this.filterByLabel(this.taskListOverride, this.activeFilter.label);

      let taggedList = this.filterByTagList(filteredTaskList, this.selectedTags);
      let searchedList = this.filterBySearchText(taggedList, this.searchText);

      return searchedList;
    },
    inAppRewards () {
      let watchRefresh = this.forceRefresh; // eslint-disable-line
      let rewards = inAppRewards(this.user);

      // Add season rewards if user is affected
      // @TODO: Add buff conditional
      const seasonalSkills = {
        snowball: 'salt',
        spookySparkles: 'opaquePotion',
        shinySeed: 'petalFreePotion',
        seafoam: 'sand',
      };

      for (let key in seasonalSkills) {
        if (this.getUserBuffs(key)) {
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
      return this.isUser === true && this.type === 'reward' && this.activeFilter.label !== 'custom';
    },
    initialColumnDescription () {
      // Show the column description in the middle only if there are no elements (tasks or in app items)
      if (this.hasRewardsList) {
        if (this.inAppRewards && this.inAppRewards.length >= 0) return false;
      }

      return this.taskList.length === 0;
    },
    quickAddPlaceholder () {
      const type = this.$t(this.type);
      return this.$t('addATask', {type});
    },
    badgeCount () {
      // 0 means the badge will not be shown
      // It is shown for the all and due views of dailies
      // and for the active and scheduled views of todos.
      if (this.type === 'todo' && this.activeFilter.label !== 'complete2') {
        return this.taskList.length;
      } else if (this.type === 'daily') {
        if (this.activeFilter.label === 'due') {
          return this.taskList.length;
        } else if (this.activeFilter.label === 'all') {
          return this.taskList.reduce((count, t) => {
            return !t.completed && shouldDo(new Date(), t, this.getUserPreferences) ? count + 1 : count;
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
    this.$root.$on('habitica::resync-completed', () => {
      if (this.activeFilter.label !== 'complete2') return;
      this.loadCompletedTodos();
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
    async taskSorted (data) {
      const filteredList = this.taskList;
      const taskToMove = filteredList[data.oldIndex];
      const taskIdToMove = taskToMove._id;
      let originTasks = this.getUnfilteredTaskList(this.type);
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
      const list = this.getUnfilteredTaskList(this.type);

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
    async rewardSorted (data) {
      const rewardsList = this.inAppRewards;
      const rewardToMove = rewardsList[data.oldIndex];

      let newOrder = await this.$store.dispatch('user:movePinnedItem', {
        path: rewardToMove.path,
        position: data.newIndex,
      });
      this.user.pinnedItemsOrder = newOrder;
    },
    rewardDragStart () {
      // We need to stop popovers from interfering with our dragging
      this.showPopovers = false;
      this.isDragging(true);
    },
    rewardDragEnd () {
      this.showPopovers = true;
      this.isDragging(false);
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
        const task = taskDefaults({type: this.type, text: taskText}, this.user);
        task.tags = this.selectedTags;
        return task;
      });

      this.quickAddText = '';
      this.quickAddRows = 1;
      this.createTask(tasks);
      this.$refs.quickAdd.blur();
    },
    editTask (task) {
      this.$emit('editTask', task);
    },
    activateFilter (type, filter = '') {
      // Needs a separate API call as this data may not reside in store
      if (type === 'todo' && filter === 'complete2') {
        if (this.group && this.group._id) {
          this.$emit('loadGroupCompletedTodos');
        } else {
          this.loadCompletedTodos();
        }
      }

      // the only time activateFilter is called with filter==='' is when the component is first created
      // this can be used to check If the user has set 'due' as default filter for daily
      // and set the filter as 'due' only when the component first loads and not on subsequent reloads.
      if (type === 'daily' && filter === '' && this.user.preferences.dailyDueDefaultView) {
        filter = 'due';
      }

      this.activeFilter = getActiveFilter(type, filter);
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
    filterByLabel (taskList, filter) {
      if (!taskList) return [];
      return taskList.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'complete2') return task.completed;
        if (filter === 'due') return !task.completed && task.isDue;
        if (filter === 'notDue') return task.completed || !task.isDue;
        return !task.completed;
      });
    },
    filterByTagList (taskList, tagList = []) {
      let filteredTaskList = taskList;
      // filter requested tasks by tags
      if (!isEmpty(tagList)) {
        filteredTaskList = taskList.filter(
          task => tagList.every(tag => task.tags.indexOf(tag) !== -1)
        );
      }
      return filteredTaskList;
    },
    filterBySearchText (taskList, searchText = '') {
      let filteredTaskList = taskList;
      // filter requested tasks by search text
      if (searchText) {
        // to ensure broadest case insensitive search matching
        let searchTextLowerCase = searchText.toLowerCase();
        filteredTaskList = taskList.filter(
          task => {
            // eslint rule disabled for block to allow nested binary expression
            /* eslint-disable no-extra-parens */
            return (
              task.text.toLowerCase().indexOf(searchTextLowerCase) > -1 ||
              (task.notes && task.notes.toLowerCase().indexOf(searchTextLowerCase) > -1) ||
              (task.checklist && task.checklist.length > 0 &&
                task.checklist.some(checkItem => checkItem.text.toLowerCase().indexOf(searchTextLowerCase) > -1))
            );
            /* eslint-enable no-extra-parens */
          });
      }
      return filteredTaskList;
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
      if (!item.pinType) {
        this.error(this.$t('errorTemporaryItem'));
        return;
      }

      try {
        if (!this.$store.dispatch('user:togglePinnedItem', {type: item.pinType, path: item.path})) {
          this.text(this.$t('unpinnedItem', {item: item.text}));
        }
      } catch (e) {
        this.error(e.message);
      }
    },
    isDragging (dragging) {
      this.dragging = dragging;
      if (dragging) {
        document.documentElement.classList.add('draggable-cursor');
      } else {
        document.documentElement.classList.remove('draggable-cursor');
      }
    },
    taskDestroyed (task) {
      this.$emit('taskDestroyed', task);
    },
  },
};
</script>
