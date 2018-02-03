<template lang="pug">
.standard-page
  .row.tasks-navigation
    .col-12.col-md-4
      h1 Group's Tasks
    // @TODO: Abstract to component!
    .col-12.col-md-4
      .input-group
        input.form-control.input-search(type="text", :placeholder="$t('search')", v-model="searchText")
        .filter-panel(v-if="isFilterPanelOpen")
          .tags-category(v-for="tagsType in tagsByType", v-if="tagsType.tags.length > 0", :key="tagsType.key")
            .tags-header.col-12
              strong(v-once) {{ $t(tagsType.key) }}
              a.d-block(v-if="tagsType.key === 'tags' && !editingTags", @click="editTags()") {{ $t('editTags2') }}
            .tags-list.container.col-12
              .row(:class="{'no-gutters': !editingTags}")
                template(v-if="editingTags && tagsType.key === 'tags'")
                  .col-12.col-md-6(v-for="(tag, tagIndex) in tagsSnap")
                    .inline-edit-input-group.tag-edit-item.input-group
                      input.tag-edit-input.inline-edit-input.form-control(type="text", :value="tag.name")
                      .input-group-append(@click="removeTag(tagIndex)")
                        .svg-icon.destroy-icon(v-html="icons.destroy")
                  .col-12.col-md-6
                    input.new-tag-item.edit-tag-item.inline-edit-input.form-control(type="text", :placeholder="$t('newTag')", @keydown.enter="addTag($event)", v-model="newTag")
                template(v-else)
                  .col-12.col-md-6(v-for="(tag, tagIndex) in tagsType.tags")
                    .custom-control.custom-checkbox
                      input.custom-control-input(
                        type="checkbox",
                        :checked="isTagSelected(tag)",
                        @change="toggleTag(tag)",
                        :id="`tag-${tagsType.key}-${tagIndex}`",
                      )
                      label.custom-control-label(:for="`tag-${tagsType.key}-${tagIndex}`") {{ tag.name }}

          .filter-panel-footer.clearfix
            template(v-if="editingTags === true")
              .text-center
                a.mr-3.btn-filters-primary(@click="saveTags()", v-once) {{ $t('saveEdits') }}
                a.btn-filters-secondary(@click="cancelTagsEditing()", v-once) {{ $t('cancel') }}
            template(v-else)
              .float-left
                a.btn-filters-danger(@click="resetFilters()", v-once) {{ $t('resetFilters') }}
              .float-right
                a.mr-3.btn-filters-primary(@click="applyFilters()", v-once) {{ $t('applyFilters') }}
                a.btn-filters-secondary(@click="closeFilterPanel()", v-once) {{ $t('cancel') }}
        span.input-group-append
          button.btn.btn-secondary.filter-button(
            type="button",
            @click="toggleFilterPanel()",
            :class="{'filter-button-open': selectedTags.length > 0}",
          )
            .d-flex.align-items-center
              span(v-once) {{ $t('filter') }}
              .svg-icon.filter-icon(v-html="icons.filter")
    #create-dropdown.col-12.col-md-1.offset-md-3
      b-dropdown(:right="true", :variant="'success'")
        div(slot="button-content")
          .svg-icon.positive(v-html="icons.positive")
          | {{ $t('addTaskToGroupPlan') }}
        b-dropdown-item(v-for="type in columns", :key="type", @click="createTask(type)")
          span.dropdown-icon-item(v-once)
            span.svg-icon.inline(v-html="icons[type]")
            span.text {{$t(type)}}
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
  .row
    task-column.col-12.col-sm-6.col-3(
      v-for="column in columns",
      :type="column",
      :key="column",
      :taskListOverride='tasksByType[column]',
      v-on:editTask="editTask",
      :group='group',
      :searchText="searchText")
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .user-tasks-page {
    padding-top: 31px;
  }

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

  .dropdown-icon-item .svg-icon {
    width: 16px;
  }

  button.btn.btn-secondary.filter-button {
    box-shadow: none;
    border-radius: 2px;
    border: 1px solid $gray-400 !important;

    &:hover, &:active, &:focus, &.open {
      box-shadow: none;
      border-color: $purple-500 !important;
      color: $gray-50 !important;
    }

    &.filter-button-open {
      color: $purple-200 !important;

      .filter-icon {
        color: $purple-200 !important;
      }
    }

    .filter-icon {
      height: 10px;
      width: 12px;
      color: $gray-50;
      margin-left: 15px;
    }
  }

  .filter-panel {
    position: absolute;
    padding-left: 24px;
    padding-right: 24px;
    max-width: 40vw;
    width: 100%;
    z-index: 9999;
    background: $white;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    top: 44px;
    left: 20vw;
    font-size: 14px;
    line-height: 1.43;
    text-overflow: ellipsis;

    .tags-category {
      border-bottom: 1px solid $gray-600;
      padding-bottom: 24px;
      padding-top: 24px;
    }

    .tags-header {
       flex-basis: 96px;
       flex-shrink: 0;

      a {
        font-size: 12px;
        line-height: 1.33;
        color: $blue-10;
        margin-top: 4px;

        &:focus, &:hover, &:active {
          text-decoration: underline;
        }
      }
    }

    .tag-edit-input {
      border-bottom: 1px solid $gray-500 !important;

      &:focus, &:focus ~ .input-group-append {
        border-color: $purple-500 !important;
      }
    }

    .new-tag-item {
      width: 100%;
      background-repeat: no-repeat;
      background-position: center left 10px;
      border-bottom: 1px solid $gray-500 !important;
      background-size: 10px 10px;
      padding-left: 40px;
      background-image: url(~client/assets/svg/for-css/positive.svg);
    }

    .tag-edit-item .input-group-append {
      border-bottom: 1px solid $gray-500 !important;

      &:focus {
        border-color: $purple-500;
      }
    }

    .custom-control-label {
      margin-left: 10px;
    }

    .filter-panel-footer {
      padding-top: 16px;
      padding-bottom: 16px;

      a {
        &:focus, &:hover, &:active {
          text-decoration: underline;
        }
      }

      .btn-filters-danger {
        color: $red-50;
      }

      .btn-filters-primary {
        color: $blue-10;
      }

      .btn-filters-secondary {
        color: $gray-300;
      }
    }
  }
</style>

<script>
import taskDefaults from 'common/script/libs/taskDefaults';
import TaskColumn from '../tasks/column';
import TaskModal from '../tasks/taskModal';

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
  },
  data () {
    return {
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
    createTask (type) {
      this.taskFormPurpose = 'create';
      this.creatingTask = taskDefaults({type, text: ''});
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
