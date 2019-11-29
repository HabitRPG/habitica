<template>
  <div class="standard-page">
    <group-plan-overview-modal />
    <task-modal
      ref="taskModal"
      :task="workingTask"
      :purpose="taskFormPurpose"
      :group-id="groupId"
      @cancel="cancelTaskModal()"
      @taskCreated="taskCreated"
      @taskEdited="taskEdited"
      @taskDestroyed="taskDestroyed"
    />
    <div class="row tasks-navigation">
      <div class="col-12 col-md-4">
        <h1>{{ $t('groupTasksTitle') }}</h1>
      </div>
      <!-- @TODO: Abstract to component!-->
      <div class="col-12 col-md-4">
        <input
          v-model="searchText"
          class="form-control input-search"
          type="text"
          :placeholder="$t('search')"
        >
      </div>
      <div
        v-if="canCreateTasks"
        class="create-task-area d-flex"
      >
        <transition name="slide-tasks-btns">
          <div
            v-if="openCreateBtn"
            class="d-flex"
          >
            <div
              v-for="type in columns"
              :key="type"
              v-b-tooltip.hover.bottom="$t(type)"
              class="create-task-btn diamond-btn"
              @click="createTask(type)"
            >
              <div
                class="svg-icon"
                :class="`icon-${type}`"
                v-html="icons[type]"
              ></div>
            </div>
          </div>
        </transition>
        <div
          id="create-task-btn"
          class="create-btn diamond-btn btn btn-success"
          :class="{open: openCreateBtn}"
          @click="openCreateBtn = !openCreateBtn"
        >
          <div
            class="svg-icon"
            v-html="icons.positive"
          ></div>
        </div>
        <b-tooltip
          v-if="!openCreateBtn"
          target="create-task-btn"
          placement="bottom"
        >
          {{ $t('addTaskToGroupPlan') }}
        </b-tooltip>
      </div>
    </div>
    <div class="row">
      <task-column
        v-for="column in columns"
        :key="column"
        class="col-12 col-md-3"
        :type="column"
        :task-list-override="tasksByType[column]"
        :group="group"
        :search-text="searchText"
        @editTask="editTask"
        @loadGroupCompletedTodos="loadGroupCompletedTodos"
        @taskDestroyed="taskDestroyed"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/create-task.scss';

  .tasks-navigation {
    margin-bottom: 40px;
  }

  .positive {
    display: inline-block;
    width: 10px;
    color: $green-500;
    margin-right: 8px;
    padding-top: 6px;
  }
</style>

<script>
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import groupBy from 'lodash/groupBy';
import taskDefaults from '@/../../common/script/libs/taskDefaults';
import TaskColumn from '../tasks/column';
import TaskModal from '../tasks/taskModal';
import GroupPlanOverviewModal from './groupPlanOverviewModal';

import positiveIcon from '@/assets/svg/positive.svg';
import filterIcon from '@/assets/svg/filter.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import habitIcon from '@/assets/svg/habit.svg';
import dailyIcon from '@/assets/svg/daily.svg';
import todoIcon from '@/assets/svg/todo.svg';
import rewardIcon from '@/assets/svg/reward.svg';

import { mapState } from '@/libs/store';

export default {
  components: {
    TaskColumn,
    TaskModal,
    GroupPlanOverviewModal,
  },
  props: ['groupId'],
  data () {
    return {
      openCreateBtn: false,
      searchId: '',
      columns: ['habit', 'daily', 'todo', 'reward'],
      tasksByType: {
        habit: [],
        daily: [],
        todo: [],
        reward: [],
      },
      editingTask: {},
      creatingTask: {},
      workingTask: {},
      taskFormPurpose: 'create',
      // @TODO: Separate component?
      searchText: '',
      selectedTags: [],
      temporarilySelectedTags: [],
      isFilterPanelOpen: false,
      icons: Object.freeze({
        positive: positiveIcon,
        filter: filterIcon,
        destroy: deleteIcon,
        habit: habitIcon,
        daily: dailyIcon,
        todo: todoIcon,
        reward: rewardIcon,
      }),
      editingTags: false,
      group: {},
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    tagsByType () {
      const userTags = this.user.tags;
      const tagsByType = {
        challenges: {
          key: 'challenges',
          tags: [],
        },
        groups: {
          key: 'groups',
          tags: [],
        },
        user: {
          key: 'tags',
          tags: [],
        },
      };

      userTags.forEach(t => {
        if (t.group) {
          tagsByType.groups.tags.push(t);
        } else if (t.challenge) {
          tagsByType.challenges.tags.push(t);
        } else {
          tagsByType.user.tags.push(t);
        }
      });

      return tagsByType;
    },
    canCreateTasks () {
      if (!this.group) return false;
      return (this.group.leader && this.group.leader._id === this.user._id)
        || (this.group.managers && Boolean(this.group.managers[this.user._id]));
    },
  },
  watch: {
    // call again the method if the route changes (when this route is already active)
    $route: 'load',
  },
  beforeRouteUpdate (to, from, next) {
    this.$set(this, 'searchId', to.params.groupId);
    next();
  },
  mounted () {
    if (!this.searchId) this.searchId = this.groupId;
    this.load();

    if (this.$route.query.showGroupOverview) {
      this.$root.$emit('bv::show::modal', 'group-plan-overview');
    }
  },
  methods: {
    async load () {
      this.tasksByType = {
        habit: [],
        daily: [],
        todo: [],
        reward: [],
      };

      this.group = await this.$store.dispatch('guilds:getGroup', {
        groupId: this.searchId,
      });

      const members = await this.$store.dispatch('members:getGroupMembers', { groupId: this.searchId });
      this.group.members = members;

      const tasks = await this.$store.dispatch('tasks:getGroupTasks', {
        groupId: this.searchId,
      });

      const groupedApprovals = await this.loadApprovals();

      tasks.forEach(task => {
        if (
          groupedApprovals[task._id]
          && groupedApprovals[task._id].length > 0
        ) task.approvals = groupedApprovals[task._id];
        this.tasksByType[task.type].push(task);
      });
    },
    async loadApprovals () {
      const approvalRequests = await this.$store.dispatch('tasks:getGroupApprovals', {
        groupId: this.searchId,
      });

      return groupBy(approvalRequests, 'group.taskId');
    },
    editTask (task) {
      this.taskFormPurpose = 'edit';
      this.editingTask = cloneDeep(task);
      this.workingTask = this.editingTask;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('bv::show::modal', 'task-modal');
      });
    },
    async loadGroupCompletedTodos () {
      const completedTodos = await this.$store.dispatch('tasks:getCompletedGroupTasks', {
        groupId: this.searchId,
      });

      completedTodos.forEach(task => {
        const existingTaskIndex = findIndex(this.tasksByType.todo, todo => todo._id === task._id);
        if (existingTaskIndex === -1) {
          this.tasksByType.todo.push(task);
        }
      });
    },
    createTask (type) {
      this.openCreateBtn = false;
      this.taskFormPurpose = 'create';
      this.creatingTask = taskDefaults({ type, text: '' }, this.user);
      this.workingTask = this.creatingTask;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('bv::show::modal', 'task-modal');
      });
    },
    taskCreated (task) {
      task.group.id = this.group._id;
      this.tasksByType[task.type].push(task);
    },
    taskEdited (task) {
      const index = findIndex(this.tasksByType[task.type], taskItem => taskItem._id === task._id);
      this.tasksByType[task.type].splice(index, 1, task);
    },
    taskDestroyed (task) {
      const index = findIndex(this.tasksByType[task.type], taskItem => taskItem._id === task._id);
      this.tasksByType[task.type].splice(index, 1);
    },
    cancelTaskModal () {
      this.editingTask = null;
      this.creatingTask = null;
      this.workingTask = {};
    },
    toggleFilterPanel () {
      if (this.isFilterPanelOpen === true) {
        this.closeFilterPanel();
      } else {
        this.openFilterPanel();
      }
    },
    openFilterPanel () {
      this.isFilterPanelOpen = true;
      this.temporarilySelectedTags = this.selectedTags.slice();
    },
    closeFilterPanel () {
      this.temporarilySelectedTags = [];
      this.isFilterPanelOpen = false;
    },
    resetFilters () {
      this.selectedTags = [];
      this.closeFilterPanel();
    },
    applyFilters () {
      const { temporarilySelectedTags } = this;
      this.selectedTags = temporarilySelectedTags.slice();
      this.closeFilterPanel();
    },
    toggleTag (tag) {
      const { temporarilySelectedTags } = this;
      const tagI = temporarilySelectedTags.indexOf(tag.id);
      if (tagI === -1) {
        temporarilySelectedTags.push(tag.id);
      } else {
        temporarilySelectedTags.splice(tagI, 1);
      }
    },
    isTagSelected (tag) {
      const tagId = tag.id;
      if (this.temporarilySelectedTags.indexOf(tagId) !== -1) return true;
      return false;
    },
  },
};
</script>
