<template lang="pug">
.standard-page
  group-plan-overview-modal
  task-modal(
    :task="workingTask",
    :purpose="taskFormPurpose",
    @cancel="cancelTaskModal()",
    ref="taskModal",
    :groupId="groupId",
    v-on:taskCreated='taskCreated',
    v-on:taskEdited='taskEdited',
    v-on:taskDestroyed='taskDestroyed'
  )
  .row.tasks-navigation
    .col-12.col-md-4
      h1 {{ $t('groupTasksTitle') }}
    // @TODO: Abstract to component!
    .col-12.col-md-4
      input.form-control.input-search(type="text", :placeholder="$t('search')", v-model="searchText")
    .create-task-area.d-flex(v-if='canCreateTasks')
      transition(name="slide-tasks-btns")
        .d-flex(v-if="openCreateBtn")
          .create-task-btn.rounded-btn(
            v-for="type in columns",
            :key="type",
            @click="createTask(type)",
            v-b-tooltip.hover.bottom="$t(type)",
          )
            .svg-icon(v-html="icons[type]", :class='`icon-${type}`')

      #create-task-btn.create-btn.rounded-btn.btn.btn-success(
        @click="openCreateBtn = !openCreateBtn",
        :class="{open: openCreateBtn}",
      )
        .svg-icon(v-html="icons.positive")
      b-tooltip(target="create-task-btn", placement="bottom", v-if="!openCreateBtn") {{ $t('addTaskToGroupPlan') }}

  .row
    task-column.col-12.col-md-3(
      v-for="column in columns",
      :type="column",
      :key="column",
      :taskListOverride='tasksByType[column]',
      v-on:editTask="editTask",
      v-on:loadGroupCompletedTodos="loadGroupCompletedTodos",
      v-on:taskDestroyed="taskDestroyed",
      :group='group',
      :searchText="searchText")
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/create-task.scss';

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
import taskDefaults from 'common/script/libs/taskDefaults';
import TaskColumn from '../tasks/column';
import TaskModal from '../tasks/taskModal';
import GroupPlanOverviewModal from './groupPlanOverviewModal';

import positiveIcon from 'assets/svg/positive.svg';
import filterIcon from 'assets/svg/filter.svg';
import deleteIcon from 'assets/svg/delete.svg';
import habitIcon from 'assets/svg/habit.svg';
import dailyIcon from 'assets/svg/daily.svg';
import todoIcon from 'assets/svg/todo.svg';
import rewardIcon from 'assets/svg/reward.svg';

import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import groupBy from 'lodash/groupBy';
import { mapState } from 'client/libs/store';

export default {
  props: ['groupId'],
  components: {
    TaskColumn,
    TaskModal,
    GroupPlanOverviewModal,
  },
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
  computed: {
    ...mapState({user: 'user.data'}),
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
      return this.group.leader && this.group.leader._id === this.user._id || this.group.managers && Boolean(this.group.managers[this.user._id]);
    },
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

      let members = await this.$store.dispatch('members:getGroupMembers', {groupId: this.searchId});
      this.group.members = members;

      let tasks = await this.$store.dispatch('tasks:getGroupTasks', {
        groupId: this.searchId,
      });

      let groupedApprovals = await this.loadApprovals();

      tasks.forEach((task) => {
        if (groupedApprovals[task._id] && groupedApprovals[task._id].length > 0) task.approvals = groupedApprovals[task._id];
        this.tasksByType[task.type].push(task);
      });
    },
    async loadApprovals () {
      if (this.group.leader._id !== this.user._id) return [];

      let approvalRequests = await this.$store.dispatch('tasks:getGroupApprovals', {
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

      completedTodos.forEach((task) => {
        const existingTaskIndex = findIndex(this.tasksByType.todo, (todo) => {
          return todo._id === task._id;
        });
        if (existingTaskIndex === -1) {
          this.tasksByType.todo.push(task);
        }
      });
    },
    createTask (type) {
      this.openCreateBtn = false;
      this.taskFormPurpose = 'create';
      this.creatingTask = taskDefaults({type, text: ''}, this.user);
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
      let index = findIndex(this.tasksByType[task.type], (taskItem) => {
        return taskItem._id === task._id;
      });
      this.tasksByType[task.type].splice(index, 1, task);
    },
    taskDestroyed (task) {
      let index = findIndex(this.tasksByType[task.type], (taskItem) => {
        return taskItem._id === task._id;
      });
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
      const temporarilySelectedTags = this.temporarilySelectedTags;
      this.selectedTags = temporarilySelectedTags.slice();
      this.closeFilterPanel();
    },
    toggleTag (tag) {
      const temporarilySelectedTags = this.temporarilySelectedTags;
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
