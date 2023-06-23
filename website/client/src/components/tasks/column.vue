<template>
  <div
    class="tasks-column"
    :class="type"
  >
    <b-modal ref="editTaskModal" />
    <buy-quest-modal
      v-if="type === 'reward'"
      :item="selectedItemToBuy || {}"
      :price-type="selectedItemToBuy ? selectedItemToBuy.currency : ''"
      :with-pin="true"
      @change="resetItemToBuy($event)"
    />
    <div class="d-flex align-items-center">
      <h2 class="column-title">
        {{ $t(typeLabel) }}
      </h2>
      <div
        v-if="badgeCount > 0"
        class="badge badge-pill badge-purple column-badge mx-1"
      >
        {{ badgeCount }}
      </div>
      <div
        v-if="typeFilters.length > 1"
        class="filters d-flex justify-content-end"
      >
        <div
          v-for="filter in typeFilters"
          :key="filter"
          class="filter small-text"
          :class="{active: activeFilter.label === filter}"
          tabindex="0"
          @click="activateFilter(type, filter)"
          @keypress.enter="activateFilter(type, filter)"
        >
          {{ $t(filter) }}
        </div>
      </div>
    </div>
    <div
      ref="tasksWrapper"
      class="tasks-list"
    >
      <textarea
        v-if="isUser || canCreateTasks()"
        ref="quickAdd"
        v-model="quickAddText"
        class="quick-add"
        :rows="quickAddRows"
        :placeholder="quickAddPlaceholder"
        @keypress.enter="quickAdd"
        @focus="quickAddFocused = true"
        @blur="quickAddFocused = false"
      ></textarea>
      <transition name="quick-add-tip-slide">
        <div
          v-show="quickAddFocused"
          class="quick-add-tip small-text"
          v-html="$t('addMultipleTip', {taskType: $t(typeLabel)})"
        ></div>
      </transition>
      <clear-completed-todos
        v-if="activeFilter.label === 'complete2' && isUser === true && taskList.length > 0"
      />
      <div
        v-if="isUser === true"
        ref="columnBackground"
        class="column-background"
        :class="{'initial-description': initialColumnDescription}"
      >
        <div
          v-once
          class="svg-icon"
          :class="`icon-${type}`"
          v-html="icons[type]"
        ></div>
        <h3 v-once>
          {{ $t('theseAreYourTasks', {taskType: $t(typeLabel)}) }}
        </h3>
        <div class="small-text">
          {{ $t(`${type}sDesc`) }}
        </div>
      </div>
      <draggable
        v-if="taskList.length > 0"
        ref="tasksList"
        class="sortable-tasks"
        :options="{disabled: activeFilter.label === 'scheduled' || !canBeDragged(),
                   scrollSensitivity: 64}"
        :delay-on-touch-only="true"
        :delay="100"
        @update="taskSorted"
        @start="isDragging(true)"
        @end="isDragging(false)"
      >
        <task
          v-for="task in taskList"
          :key="task.id"
          :task="task"
          :is-user="isUser"
          :group="group"
          :challenge="challenge"
          @editTask="editTask"
          @taskSummary="taskSummary"
          @moveTo="moveTo"
          @taskDestroyed="taskDestroyed"
        />
      </draggable>
      <template v-if="hasRewardsList">
        <draggable
          ref="rewardsList"
          class="reward-items"
          :delay-on-touch-only="true"
          :delay="100"
          @update="rewardSorted"
          @start="rewardDragStart"
          @end="rewardDragEnd"
        >
          <shopItem
            v-for="reward in inAppRewards"
            :key="reward.key"
            :item="reward"
            :show-popover="showPopovers"
            :popover-position="'left'"
            @click="openBuyDialog(reward)"
          >
            <template
              slot="itemBadge"
              slot-scope="ctx"
            >
              <span
                class="badge-top"
                @click.prevent.stop="togglePinned(ctx.item)"
                @keypress.enter.prevent.stop="togglePinned(ctx.item)"
              >
                <pin-badge
                  :pinned="ctx.item.pinned"
                />
              </span>
            </template>
          </shopItem>
        </draggable>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  ::v-deep .draggable-cursor {
    cursor: grabbing;
  }

  .badge-pin {
    display: none;
  }

  .item:hover .badge-pin {
    display: block;
  }

  .item:focus-within .badge-pin {
    display: block;
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
      grid-column-gap: 10px;
      grid-row-gap: 4px;
      grid-template-columns: repeat(auto-fill, 94px);
    }

    @supports not (display: grid) {
      display: flex;
      flex-wrap: wrap;
      & > div {
        margin: 0 10px 4px 0;
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
    overflow: hidden;

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
    margin-left: -8px;

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
import throttle from 'lodash/throttle';
import isEmpty from 'lodash/isEmpty';
import draggable from 'vuedraggable';
import { shouldDo } from '@/../../common/script/cron';
import inAppRewards from '@/../../common/script/libs/inAppRewards';
import taskDefaults from '@/../../common/script/libs/taskDefaults';
import Task from './task';
import ClearCompletedTodos from './clearCompletedTodos';
import buyMixin from '@/mixins/buy';
import sync from '@/mixins/sync';
import externalLinks from '@/mixins/externalLinks';
import { mapState, mapActions, mapGetters } from '@/libs/store';
import shopItem from '../shops/shopItem';
import BuyQuestModal from '@/components/shops/quests/buyQuestModal.vue';
import PinBadge from '@/components/ui/pinBadge';

import notifications from '@/mixins/notifications';

import {
  getTypeLabel,
  getFilterLabels,
  getActiveFilter,
  sortAndFilterTasks,
} from '@/libs/store/helpers/filterTasks';

import habitIcon from '@/assets/svg/habit.svg';
import dailyIcon from '@/assets/svg/daily.svg';
import todoIcon from '@/assets/svg/todo.svg';
import rewardIcon from '@/assets/svg/reward.svg';
import { EVENTS } from '@/libs/events';

export default {
  components: {
    Task,
    ClearCompletedTodos,
    BuyQuestModal,
    PinBadge,
    shopItem,
    draggable,
  },
  mixins: [buyMixin, notifications, sync, externalLinks],
  // @TODO Set default values for props
  // allows for better control of props values
  // allows for better control of where this component is called
  props: {
    type: {},
    isUser: {
      type: Boolean,
      default: false,
    },
    draggableOverride: {
      type: Boolean,
      default: false,
    },
    searchText: {},
    selectedTags: {},
    taskListOverride: {},
    group: {},
    challenge: {},
  }, // @TODO: maybe we should store the group on state?
  data () {
    const icons = Object.freeze({
      habit: habitIcon,
      daily: dailyIcon,
      todo: todoIcon,
      reward: rewardIcon,
    });

    const typeLabel = '';
    const typeFilters = [];
    const activeFilter = {};

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
      const filteredTaskList = this.isUser
        ? this.getFilteredTaskList({
          type: this.type,
          filterType: this.activeFilter.label,
        })
        : this.filterByLabel(this.taskListOverride, this.type, this.activeFilter.label);

      const taggedList = this.filterByTagList(filteredTaskList, this.selectedTags);
      const searchedList = this.filterBySearchText(taggedList, this.searchText);

      return searchedList;
    },
    inAppRewards () {
      let watchRefresh = this.forceRefresh; // eslint-disable-line
      const rewards = inAppRewards(this.user);

      return rewards;
    },
    hasRewardsList () {
      return this.isUser === true && this.type === 'reward' && this.activeFilter.label !== 'custom';
    },
    initialColumnDescription () {
      // Show the column description in the middle only
      // if there are no elements (tasks or in app items)
      if (this.hasRewardsList) {
        if (this.inAppRewards && this.inAppRewards.length >= 0) return false;
      }

      return this.taskList.length === 0;
    },
    quickAddPlaceholder () {
      const type = this.$t(this.type);
      return this.$t('addATask', { type });
    },
    badgeCount () {
      // 0 means the badge will not be shown
      // It is shown for the all and due views of dailies
      // and for the active and scheduled views of todos.
      if (this.type === 'todo' && this.activeFilter.label !== 'complete2') {
        return this.taskList.length;
      } if (this.type === 'daily') {
        if (this.activeFilter.label === 'due') {
          return this.taskList.length;
        } if (this.activeFilter.label === 'all') {
          return this.taskList
            .reduce(
              (count, t) => (!t.completed
                && shouldDo(new Date(), t, this.getUserPreferences) ? count + 1 : count),
              0,
            );
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
  created () {
    // Set Task Column Label
    this.typeLabel = getTypeLabel(this.type);
    // Get Category Filter Labels
    this.typeFilters = getFilterLabels(this.type, this.challenge);
    // Set default filter for task column

    if (this.challenge) {
      this.activateFilter(this.type);
    } else {
      this.activateFilter(this.type, this.user.preferences.tasks.activeFilter[this.type], true);
    }
  },
  mounted () {
    this.setColumnBackgroundVisibility();

    this.$root.$on('buyModal::boughtItem', () => {
      this.forceRefresh = new Date();
    });

    if (this.type !== 'todo') return;
    this.$root.$on(EVENTS.RESYNC_COMPLETED, () => {
      if (this.activeFilter.label !== 'complete2') return;
      this.loadCompletedTodos();
    });
    this.handleExternalLinks();
  },
  updated () {
    this.handleExternalLinks();
  },
  beforeDestroy () {
    this.$root.$off('buyModal::boughtItem');
    if (this.type !== 'todo') return;
    this.$root.$off(EVENTS.RESYNC_COMPLETED);
  },
  methods: {
    ...mapActions({
      loadCompletedTodos: 'tasks:fetchCompletedTodos',
      createTask: 'tasks:create',
      createGroupTasks: 'tasks:createGroupTasks',
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
      if (taskToMove.group.id && !this.isUser) {
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
      const list = this.taskListOverride || this.getUnfilteredTaskList(this.type);

      const oldPosition = list.findIndex(t => t._id === taskIdToMove);
      const moved = list.splice(oldPosition, 1);
      const newPosition = where === 'top' ? 0 : list.length;
      list.splice(newPosition, 0, moved[0]);

      if (!this.isUser) {
        await this.$store.dispatch('tasks:moveGroupTask', {
          taskId: taskIdToMove,
          position: newPosition,
        });
      } else {
        const newOrder = await this.$store.dispatch('tasks:move', {
          taskId: taskIdToMove,
          position: newPosition,
        });
        this.user.tasksOrder[`${this.type}s`] = newOrder;
      }
    },
    async rewardSorted (data) {
      const rewardsList = this.inAppRewards;
      const rewardToMove = rewardsList[data.oldIndex];

      const newOrder = await this.$store.dispatch('user:movePinnedItem', {
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
    canCreateTasks () {
      if (!this.group) return false;
      return (this.group.leader && this.group.leader._id === this.user._id)
        || (this.group.managers && Boolean(this.group.managers[this.user._id]));
    },
    async quickAdd (ev) {
      // Add a new line if Shift+Enter Pressed
      if (ev.shiftKey) {
        this.quickAddRows += 1;
        return true;
      }

      // Do not add new line is added if only Enter is pressed
      ev.preventDefault();
      const text = this.quickAddText;
      if (!text) return false;

      const tasks = text.split('\n').reverse().filter(taskText => (!!taskText)).map(taskText => {
        const task = taskDefaults({ type: this.type, text: taskText }, this.user);
        if (this.isUser) task.tags = this.selectedTags.slice();
        return task;
      });

      this.quickAddText = '';
      this.quickAddRows = 1;
      if (this.group) {
        await this.createGroupTasks({ groupId: this.group.id, tasks });
        this.sync();
      } else {
        this.createTask(tasks);
      }
      this.$refs.quickAdd.blur();
      return true;
    },
    editTask (task) {
      this.$emit('editTask', task);
    },
    taskSummary (task) {
      this.$emit('taskSummary', task);
    },
    activateFilter (type, filter = '', skipSave = false) {
      // Needs a separate API call as this data may not reside in store
      if (type === 'todo' && filter === 'complete2') {
        if (this.group && this.group._id) {
          this.$emit('loadGroupCompletedTodos');
        } else {
          this.loadCompletedTodos();
        }
      }

      // the only time activateFilter is called with filter===''
      // is when the component is first created
      // this can be used to check If the user has set 'due'
      // as default filter for daily
      // and set the filter as 'due' only when the component first
      // loads and not on subsequent reloads.
      if (type === 'daily' && filter === '' && !this.challenge) {
        filter = 'due'; // eslint-disable-line no-param-reassign
      }

      this.activeFilter = getActiveFilter(type, filter, this.challenge);

      if (!skipSave && !this.challenge) {
        const propertyToUpdate = `preferences.tasks.activeFilter.${type}`;
        this.$store.dispatch('user:set', { [propertyToUpdate]: filter });
      }
    },
    setColumnBackgroundVisibility () {
      this.$nextTick(() => {
        if (!this.$refs.columnBackground || !this.$refs.tasksList) return;

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
    filterByLabel (taskList, type, filter) {
      if (!taskList) return [];
      const selectedFilter = getActiveFilter(type, filter, this.challenge);
      return sortAndFilterTasks(taskList, selectedFilter, Boolean(this.group));
    },
    filterByTagList (taskList, tagList = []) {
      let filteredTaskList = taskList;
      // filter requested tasks by tags
      if (!isEmpty(tagList)) {
        filteredTaskList = taskList.filter(
          task => tagList.every(tag => task.tags.indexOf(tag) !== -1),
        );
      }
      return filteredTaskList;
    },
    filterBySearchText (taskList, searchText = '') {
      let filteredTaskList = taskList;
      // filter requested tasks by search text
      if (searchText) {
        // to ensure broadest case insensitive search matching
        const searchTextLowerCase = searchText.toLowerCase();
        filteredTaskList = taskList.filter(
          task =>
            // eslint rule disabled for block to allow nested binary expression
            /* eslint-disable no-extra-parens, implicit-arrow-linebreak, max-len */
            (
              task.text.toLowerCase().indexOf(searchTextLowerCase) > -1
              || (task.notes && task.notes.toLowerCase().indexOf(searchTextLowerCase) > -1)
              || (task.checklist && task.checklist.length > 0
                && task.checklist
                  .some(checkItem => checkItem.text.toLowerCase().indexOf(searchTextLowerCase) > -1))
            ),
          /* eslint-enable no-extra-parens, implicit-arrow-linebreak, max-len */
        );
      }
      return filteredTaskList;
    },
    openBuyDialog (rewardItem) {
      if (rewardItem.locked) return;

      // Buy armoire and health potions immediately
      const itemsToPurchaseImmediately = ['potion', 'armoire'];
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
        if (!this.$store.dispatch('user:togglePinnedItem', { type: item.pinType, path: item.path })) {
          this.text(this.$t('unpinnedItem', { item: item.text }));
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
    canBeDragged () {
      return this.isUser
        || this.draggableOverride;
    },
  },
};
</script>
