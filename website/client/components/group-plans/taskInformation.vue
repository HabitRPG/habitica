<template lang="pug">
.standard-page
  .row.tasks-navigation
    .col-4
      h1 Group's Tasks
    // @TODO: Abstract to component?
    .col-4
      .input-group
        input.form-control.input-search(type="text", :placeholder="$t('search')", v-model="searchText")
        .filter-panel(v-if="isFilterPanelOpen")
          .tags-category.d-flex(v-for="tagsType in tagsByType", v-if="tagsType.tags.length > 0", :key="tagsType.key")
            .tags-header
              strong(v-once) {{ $t(tagsType.key) }}
              a.d-block(v-if="tagsType.key === 'tags' && !editingTags", @click="editTags()") {{ $t('editTags2') }}
            .tags-list.container
              .row(:class="{'no-gutters': !editingTags}")
                template(v-if="editingTags && tagsType.key === 'tags'")
                  .col-6(v-for="(tag, tagIndex) in tagsSnap")
                    .inline-edit-input-group.tag-edit-item.input-group
                      input.tag-edit-input.inline-edit-input.form-control(type="text", :value="tag.name")
                      span.input-group-btn(@click="removeTag(tagIndex)")
                        .svg-icon.destroy-icon(v-html="icons.destroy")
                  .col-6
                    input.new-tag-item.edit-tag-item.inline-edit-input.form-control(type="text", :placeholder="$t('newTag')", @keydown.enter="addTag($event)", v-model="newTag")
                template(v-else)
                  .col-6(v-for="(tag, tagIndex) in tagsType.tags")
                    label.custom-control.custom-checkbox
                      input.custom-control-input(
                        type="checkbox",
                        :checked="isTagSelected(tag)",
                        @change="toggleTag(tag)",
                      )
                      span.custom-control-indicator
                      span.custom-control-description {{ tag.name }}

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
        span.input-group-btn
          button.btn.btn-secondary.filter-button(
            type="button",
            @click="toggleFilterPanel()",
            :class="{'filter-button-open': selectedTags.length > 0}",
          )
            .d-flex.align-items-center
              span(v-once) {{ $t('filter') }}
              .svg-icon.filter-icon(v-html="icons.filter")
    #create-dropdown.col-1.offset-3
      b-dropdown(:right="true", :variant="'success'")
        div(slot="button-content")
          .svg-icon.positive(v-html="icons.positive")
          | {{ $t('create') }}
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
      )
  .row
    task-column.col-3(
      v-for="column in columns",
      :type="column",
      :key="column",
      :taskListOverride='tasksByType[column]',
      v-on:editTask="editTask",
      :group='group')
</template>

<script>
import taskDefaults from 'common/script/libs/taskDefaults';
import TaskColumn from '../tasks/column';
import TaskModal from '../tasks/taskModal';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

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
    bDropdown,
    bDropdownItem,
  },
  data () {
    return {
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
  async mounted () {
    this.group = await this.$store.dispatch('guilds:getGroup', {
      groupId: this.groupId,
    });

    let tasks = await this.$store.dispatch('tasks:getGroupTasks', {
      groupId: this.groupId,
    });

    let approvalRequests = await this.$store.dispatch('tasks:getGroupApprovals', {
      groupId: this.groupId,
    });
    let groupedApprovals = groupBy(approvalRequests, 'group.taskId');

    tasks.forEach((task) => {
      task.approvals = groupedApprovals[task._id];
      this.tasksByType[task.type].push(task);
    });
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
    editTask (task) {
      this.taskFormPurpose = 'edit';
      this.editingTask = cloneDeep(task);
      this.workingTask = this.editingTask;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('show::modal', 'task-modal');
      });
    },
    createTask (type) {
      this.taskFormPurpose = 'create';
      this.creatingTask = taskDefaults({type, text: ''});
      this.workingTask = this.creatingTask;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('show::modal', 'task-modal');
      });
    },
    taskCreated (task) {
      this.tasksByType[task.type].push(task);
    },
    taskEdited (task) {
      let index = findIndex(this.tasksByType[task.type], (taskItem) => {
        return taskItem._id === task._id;
      });
      this.tasksByType[task.type].splice(index, 1, task);
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
  },
};
</script>
