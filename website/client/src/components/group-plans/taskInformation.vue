<template>
  <div
    class="standard-page"
    @click="openCreateBtn ? openCreateBtn = false : null"
  >
    <group-plan-overview-modal />
    <task-modal
      ref="taskModal"
      :task="workingTask"
      :purpose="taskFormPurpose"
      :group-id="groupId"
      @cancel="cancelTaskModal()"
      @taskCreated="loadTasks"
      @taskEdited="loadTasks"
      @taskDestroyed="taskDestroyed"
    />
    <task-summary
      ref="taskSummary"
      :task="editingTask"
      @cancel="cancelTaskModal()"
    />
    <div class="d-flex flex-wrap align-items-center mb-4">
      <div class="mr-auto">
        <h1>{{ group.name }}</h1>
      </div>
      <input
        v-model="searchText"
        class="form-control input-search"
        type="text"
        :placeholder="$t('search')"
      >
      <div
        class="d-flex flex-wrap align-items-center justify-content-end ml-auto"
      >
        <toggle-switch
          id="taskMirrorToggle"
          class="mr-3 mb-1 ml-auto"
          :label="'Copy tasks'"
          :checked="user.preferences.tasks.mirrorGroupTasks.indexOf(group._id) !== -1"
          :hover-text="'Show assigned and open tasks on your personal task board'"
          @change="changeMirrorPreference"
        />
        <div
          class="day-start d-flex align-items-center"
          v-html="$t('dayStart', { startTime: groupStartTime } )"
        >
        </div>
        <div class="create-task-area ml-2">
          <button
            id="create-task-btn"
            v-if="canCreateTasks"
            class="btn btn-primary create-btn d-flex align-items-center"
            :class="{open: openCreateBtn}"
            @click.stop.prevent="openCreateBtn = !openCreateBtn"
            @keypress.enter="openCreateBtn = !openCreateBtn"
            tabindex="0"
          >
            <div
              class="svg-icon icon-10 color"
              v-html="icons.positive"
            ></div>
            <div class="ml-75 mr-1"> {{ $t('addTask') }} </div>
          </button>
          <div
            v-if="openCreateBtn"
            class="dropdown"
          >
            <div
              v-for="type in columns"
              :key="type"
              @click="createTask(type)"
              class="dropdown-item d-flex px-2 py-1"
            >
              <div class="d-flex align-items-center justify-content-center task-icon">
                <div
                  class="svg-icon m-auto"
                  :class="`icon-${type}`"
                  v-html="icons[type]"
                ></div>
              </div>
              <div class="task-label ml-2">
                {{ $t(type) }}
              </div>
            </div>
          </div>
        </div>
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
        :draggable-override="canCreateTasks"
        @editTask="editTask"
        @taskSummary="taskSummary"
        @loadGroupCompletedTodos="loadGroupCompletedTodos"
        @taskDestroyed="taskDestroyed"
      />
    </div>
  </div>
</template>

<style lang="scss">
  #taskMirrorToggle {
    font-weight: bold;

    .svg-icon {
      margin: 3px 6px 0px 4px;
    }

    .toggle-switch {
      margin-left: 0px;
    }

    .toggle-switch-description {
      margin-top: 3px;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/create-task.scss';

  h1 {
    color: $purple-300;
    margin-bottom: 0px;
  }

  .create-task-area {
    position: inherit;

    .dropdown {
      right: 24px;
    }
  }

  .day-start {
    height: 2rem;
    padding: 0.25rem 0.75rem;
    border-radius: 2px;
    color: $gray-100;
    background-color: $gray-600;
  }

  @media screen and (min-width: 1200px) {
    .input-search {
      margin-left: 12.5rem;
      width: 25%;
    }
  }

  @media screen and (max-width: 1200px) {
    .input-search {
      width: 50%;
    }
  }

  @media screen and (max-width: 500px) {
    #create-task-btn {
      margin-top: 4px;
    }
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
import moment from 'moment';
import taskDefaults from '@/../../common/script/libs/taskDefaults';
import TaskColumn from '../tasks/column';
import TaskModal from '../tasks/taskModal';
import TaskSummary from '../tasks/taskSummary';
import GroupPlanOverviewModal from './groupPlanOverviewModal';
import toggleSwitch from '@/components/ui/toggleSwitch';

import sync from '../../mixins/sync';

import positiveIcon from '@/assets/svg/positive.svg';
import filterIcon from '@/assets/svg/filter.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import habitIcon from '@/assets/svg/habit.svg';
import dailyIcon from '@/assets/svg/daily.svg';
import todoIcon from '@/assets/svg/todo.svg';
import rewardIcon from '@/assets/svg/reward.svg';

import * as Analytics from '@/libs/analytics';
import { mapState } from '@/libs/store';

export default {
  components: {
    TaskColumn,
    TaskModal,
    TaskSummary,
    GroupPlanOverviewModal,
    toggleSwitch,
  },
  mixins: [sync],
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
    groupStartTime () {
      if (!this.group || !this.group.cron) return null;
      const { dayStart, timezoneOffset } = this.group.cron;
      const timezoneDiff = this.user.preferences.timezoneOffset - timezoneOffset;
      return moment()
        .hour(dayStart)
        .minute(0)
        .subtract(timezoneDiff, 'minutes')
        .format('h:mm A');
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
  async beforeRouteLeave (to, from, next) {
    await this.sync();
    next();
  },
  mounted () {
    if (!this.searchId) this.searchId = this.groupId;
    this.load();

    if (this.$route.query.showGroupOverview) {
      this.$root.$emit('bv::show::modal', 'group-plan-overview');
    }

    this.$root.$on('habitica:team-sync', () => {
      this.loadTasks();
      this.loadGroupCompletedTodos();
    });
  },
  methods: {
    async load () {
      this.group = await this.$store.dispatch('guilds:getGroup', {
        groupId: this.searchId,
      });
      if (!this.group?.purchased?.active) {
        if (this.group.type === 'guild') this.$router.push(`/groups/guild/${this.group._id}`);
        if (this.group.type === 'party') this.$router.push('/party');
        return;
      }
      this.$store.dispatch('common:setTitle', {
        subSection: this.group.name,
        section: this.$route.path.startsWith('/group-plans') ? this.$t('groupPlans') : this.$t('group'),
      });
      const members = await this.$store.dispatch('members:getGroupMembers', { groupId: this.searchId });
      this.group.members = members;

      this.loadTasks();
      if (this.user.flags.tour.groupPlans !== -2) {
        this.$root.$emit('bv::show::modal', 'group-plans-update');
      }
    },
    async loadTasks () {
      this.tasksByType = {
        habit: [],
        daily: [],
        todo: [],
        reward: [],
      };

      const tasks = await this.$store.dispatch('tasks:getGroupTasks', {
        groupId: this.searchId,
      });

      tasks.forEach(task => {
        this.tasksByType[task.type].push(task);
      });

      if (this.editingTask && this.editingTask.completed) {
        this.loadGroupCompletedTodos();
      }
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
    taskSummary (task) {
      this.editingTask = cloneDeep(task);
      Vue.nextTick(() => {
        this.$root.$emit('bv::show::modal', 'task-summary');
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
    changeMirrorPreference (newVal) {
      Analytics.track({
        eventName: 'mirror tasks',
        eventAction: 'mirror tasks',
        eventCategory: 'behavior',
        hitType: 'event',
        mirror: newVal,
        group: this.group._id,
      }, { trackOnClient: true });
      const groupsToMirror = this.user.preferences.tasks.mirrorGroupTasks || [];
      if (newVal) { // we're turning copy ON for this group
        groupsToMirror.push(this.group._id);
      } else { // we're turning copy OFF for this group
        groupsToMirror.splice(groupsToMirror.indexOf(this.group._id), 1);
      }
      this.$store.dispatch('user:set', {
        'preferences.tasks.mirrorGroupTasks': groupsToMirror,
      });
    },
  },
};
</script>
