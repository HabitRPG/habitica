<template>
  <div class="row user-tasks-page">
    <broken-task-modal />
    <task-modal
      ref="taskModal"
      :task="editingTask || creatingTask"
      :purpose="creatingTask !== null ? 'create' : 'edit'"
      @cancel="cancelTaskModal()"
    />
    <div class="col-12">
      <div class="row tasks-navigation">
        <task-filter
          :selectedTags="selectedTags"
          @search="updateSearchText"
          @filter="applyFilters"
        />
        <div class="create-task-area d-flex">
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
            {{ $t('addTaskToUser') }}
          </b-tooltip>
        </div>
      </div>
      <div class="row tasks-columns">
        <task-column
          v-for="column in columns"
          :key="column"
          class="col-lg-3 col-md-6"
          :type="column"
          :is-user="true"
          :search-text="searchText"
          :selected-tags="selectedTags"
          @editTask="editTask"
          @openBuyDialog="openBuyDialog($event)"
        />
      </div>
    </div>
    <spells />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/create-task.scss';

  .user-tasks-page {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
  }

  .tasks-navigation {
    margin-bottom: 20px;
  }

  .create-task-area {
    top: -2.5rem;
  }
</style>

<script>
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';

import TaskColumn from './column';
import TaskModal from './taskModal';
import TaskFilter from './filter/taskFilter';
import brokenTaskModal from './brokenTaskModal';
import spells from './spells';

import positiveIcon from '@/assets/svg/positive.svg';
import habitIcon from '@/assets/svg/habit.svg';
import dailyIcon from '@/assets/svg/daily.svg';
import todoIcon from '@/assets/svg/todo.svg';
import rewardIcon from '@/assets/svg/reward.svg';

import { mapState } from '@/libs/store';
import taskDefaults from '@/../../common/script/libs/taskDefaults';

export default {
  components: {
    TaskColumn,
    TaskModal,
    TaskFilter,
    spells,
    brokenTaskModal,
  },
  data () {
    return {
      columns: ['habit', 'daily', 'todo', 'reward'],
      searchText: null,
      openCreateBtn: false,
      icons: Object.freeze({
        positive: positiveIcon,
        habit: habitIcon,
        daily: dailyIcon,
        todo: todoIcon,
        reward: rewardIcon,
      }),
      selectedTags: [],
      editingTask: null,
      creatingTask: null,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('tasks'),
    });
  },
  methods: {
    editTask (task) {
      this.editingTask = cloneDeep(task);
      this.openTaskModal();
    },
    createTask (type) {
      this.openCreateBtn = false;
      this.creatingTask = taskDefaults({ type, text: '' }, this.user);
      this.creatingTask.tags = this.selectedTags.slice();
      this.openTaskModal();
    },
    cancelTaskModal () {
      this.editingTask = null;
      this.creatingTask = null;
    },
    applyFilters (tags) {
      this.selectedTags = tags;
    },
    updateSearchText (text) {
      this.searchText = text;
    },
    openBuyDialog (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
    openTaskModal () {
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('bv::show::modal', 'task-modal');
      });
    },
  },
};
</script>
