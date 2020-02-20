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
        <div class="col-12 col-md-4 offset-md-4">
          <div class="d-flex">
            <input
              v-model="searchText"
              class="form-control input-search"
              type="text"
              :placeholder="$t('search')"
            >
            <button
              class="btn btn-secondary dropdown-toggle ml-2 d-flex align-items-center search-button"
              type="button"
              :class="{active: selectedTags.length > 0}"
              @click="toggleFilterPanel()"
            >
              <div
                class="svg-icon filter-icon mr-2"
                v-html="icons.filter"
              ></div>
              <span v-once>{{ $t('tags') }}</span>
            </button>
          </div>
          <div
            v-if="isFilterPanelOpen"
            class="filter-panel"
            @mouseleave="checkMouseOver"
          >
            <!-- eslint-disable vue/no-use-v-if-with-v-for -->
            <div
              v-for="tagsType in tagsByType"
              v-if="tagsType.tags.length > 0 || tagsType.key === 'tags'"
              :key="tagsType.key"
              class="tags-category d-flex"
            >
              <!-- eslint-enable vue/no-use-v-if-with-v-for -->
              <div class="tags-header">
                <strong v-once>{{ $t(tagsType.key) }}</strong>
                <a
                  v-if="tagsType.key !== 'groups' && !editingTags"
                  class="d-block"
                  @click="editTags(tagsType.key)"
                >{{ $t('editTags2') }}</a>
              </div>
              <div class="tags-list container">
                <div
                  class="row"
                  :class="{'no-gutters': !editingTags}"
                >
                  <template v-if="editingTags && tagsType.key === 'tags'">
                    <draggable
                      v-if="tagsType.key === 'tags'"
                      v-model="tagsSnap[tagsType.key]"
                      class="row"
                    >
                      <div
                        v-for="(tag, tagIndex) in tagsSnap[tagsType.key]"
                        :key="tag.id"
                        class="col-6"
                      >
                        <div class="inline-edit-input-group tag-edit-item input-group">
                          <div
                            class="svg-icon inline drag"
                            v-html="icons.drag"
                          ></div>
                          <input
                            v-model="tag.name"
                            class="tag-edit-input inline-edit-input form-control"
                            type="text"
                          >
                          <div
                            class="input-group-append"
                            @click="removeTag(tagIndex, tagsType.key)"
                          >
                            <div
                              class="svg-icon destroy-icon"
                              v-html="icons.destroy"
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 dragSpace">
                        <input
                          v-model="newTag"
                          class="new-tag-item edit-tag-item inline-edit-input form-control"
                          type="text"
                          :placeholder="$t('newTag')"
                          @keydown.enter="addTag($event, tagsType.key)"
                        >
                      </div>
                    </draggable>
                  </template>
                  <template v-if="editingTags && tagsType.key === 'challenges'">
                    <div
                      v-for="(tag, tagIndex) in tagsSnap[tagsType.key]"
                      :key="tag.id"
                      class="col-6"
                    >
                      <div class="inline-edit-input-group tag-edit-item input-group">
                        <input
                          v-model="tag.name"
                          class="tag-edit-input inline-edit-input form-control"
                          type="text"
                        >
                        <div
                          class="input-group-append"
                          @click="removeTag(tagIndex, tagsType.key)"
                        >
                          <div
                            class="svg-icon destroy-icon"
                            v-html="icons.destroy"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-if="!editingTags || tagsType.key === 'groups'">
                    <div
                      v-for="(tag) in tagsType.tags"
                      :key="tag.id"
                      class="col-6"
                    >
                      <div class="custom-control custom-checkbox">
                        <input
                          :id="`tag-${tag.id}`"
                          class="custom-control-input"
                          type="checkbox"
                          :checked="isTagSelected(tag)"
                          @change="toggleTag(tag)"
                        >
                        <label
                          v-markdown="tag.name"
                          class="custom-control-label"
                          :for="`tag-${tag.id}`"
                        ></label>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div class="filter-panel-footer clearfix">
              <template v-if="editingTags === true">
                <div class="text-center">
                  <a
                    v-once
                    class="mr-3 btn-filters-primary"
                    @click="saveTags()"
                  >{{ $t('saveEdits') }}</a>
                  <a
                    v-once
                    class="btn-filters-secondary"
                    @click="cancelTagsEditing()"
                  >{{ $t('cancel') }}</a>
                </div>
              </template>
              <template v-else>
                <div class="float-left">
                  <a
                    v-once
                    class="btn-filters-danger"
                    @click="resetFilters()"
                  >{{ $t('resetFilters') }}</a>
                </div>
                <div class="float-right">
                  <a
                    v-once
                    class="btn-filters-secondary"
                    @click="closeFilterPanel()"
                  >{{ $t('cancel') }}</a>
                </div>
              </template>
            </div>
          </div>
        </div>
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
          :search-text="searchTextThrottled"
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

  .input-search, .search-button {
    height: 40px;
  }

  .tasks-navigation {
    margin-bottom: 20px;
  }

  .filter-icon {
    width: 16px;
    height: 16px;
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
      background-image: url(~@/assets/svg/for-css/positive.svg);
    }

    .tag-edit-item {
      .input-group-append {
        background: $white;
        border-bottom: 1px solid $gray-500 !important;

        &:focus {
          border-color: $purple-500;
        }
      }

      .destroy-icon {
        display: none;
      }

      &:hover .destroy-icon {
        display: inline;
      }
    }

    .custom-control-label {
      margin-left: 10px;
      word-break: break-word;
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

  .create-task-area {
    top: -2.5rem;
  }

  .drag {
    cursor: grab;
    margin: auto 0;
    height: 20px;
    width: 20px;

    color: #C3C0C7;

    &:hover {
      color: #878190;
    }
  }

  .dragSpace {
    padding-left: 32px;
  }

  @media only screen and (max-width: 768px) {
    .filter-panel {
      max-width: none;
      left: 0px;
    }
  }
</style>

<script>
import uuid from 'uuid';
import Vue from 'vue';
import throttle from 'lodash/throttle';
import cloneDeep from 'lodash/cloneDeep';
import draggable from 'vuedraggable';
import TaskColumn from './column';
import TaskModal from './taskModal';
import spells from './spells';
import markdown from '@/directives/markdown';

import positiveIcon from '@/assets/svg/positive.svg';
import filterIcon from '@/assets/svg/filter.svg';
import deleteIcon from '@/assets/svg/delete.svg';
import habitIcon from '@/assets/svg/habit.svg';
import dailyIcon from '@/assets/svg/daily.svg';
import todoIcon from '@/assets/svg/todo.svg';
import rewardIcon from '@/assets/svg/reward.svg';
import dragIcon from '@/assets/svg/drag_indicator.svg';

import { mapState, mapActions } from '@/libs/store';
import taskDefaults from '@/../../common/script/libs/taskDefaults';
import brokenTaskModal from './brokenTaskModal';

export default {
  components: {
    TaskColumn,
    TaskModal,
    spells,
    brokenTaskModal,
    draggable,
  },
  directives: {
    markdown,
  },
  data () {
    return {
      columns: ['habit', 'daily', 'todo', 'reward'],
      searchText: null,
      searchTextThrottled: null,
      isFilterPanelOpen: false,
      openCreateBtn: false,
      icons: Object.freeze({
        positive: positiveIcon,
        filter: filterIcon,
        destroy: deleteIcon,
        habit: habitIcon,
        daily: dailyIcon,
        todo: todoIcon,
        reward: rewardIcon,
        drag: dragIcon,
      }),
      selectedTags: [],
      temporarilySelectedTags: [],
      tagsSnap: {
        tags: [],
        challenges: [],
      }, // tags snapshot when being edited
      editingTags: false,
      newTag: null,
      editingTask: null,
      creatingTask: null,
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
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  methods: {
    ...mapActions({ setUser: 'user:set' }),
    checkMouseOver: throttle(function throttleSearch () {
      if (this.editingTags) return;
      this.closeFilterPanel();
    }, 250),
    editTags () {
      // clone the arrays being edited so that we can revert if needed
      this.tagsSnap.tags = this.tagsByType.user.tags.slice();
      this.tagsSnap.challenges = this.tagsByType.challenges.tags.slice();
      this.editingTags = true;
    },
    addTag (eventObj, key) {
      this.tagsSnap[key].push({ id: uuid.v4(), name: this.newTag });
      this.newTag = null;
    },
    removeTag (index, key) {
      const tagId = this.tagsSnap[key][index].id;
      const indexInSelected = this.selectedTags.indexOf(tagId);
      if (indexInSelected !== -1) this.$delete(this.selectedTags, indexInSelected);
      this.$delete(this.tagsSnap[key], index);
    },
    saveTags () {
      if (this.newTag) this.addTag(null, 'tags');

      this.tagsByType.user.tags = this.tagsSnap.tags;
      this.tagsByType.challenges.tags = this.tagsSnap.challenges;

      this.setUser({ tags: this.tagsSnap.tags.concat(this.tagsSnap.challenges) });
      this.cancelTagsEditing();
    },
    cancelTagsEditing () {
      this.editingTags = false;
      this.tagsSnap = {
        tags: [],
        challenges: [],
      };
      this.newTag = null;
    },
    editTask (task) {
      this.editingTask = cloneDeep(task);
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('bv::show::modal', 'task-modal');
      });
    },
    createTask (type) {
      this.openCreateBtn = false;
      this.creatingTask = taskDefaults({ type, text: '' }, this.user);
      this.creatingTask.tags = this.selectedTags;

      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('bv::show::modal', 'task-modal');
      });
    },
    cancelTaskModal () {
      this.editingTask = null;
      this.creatingTask = null;
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
    },
    toggleTag (tag) {
      const { temporarilySelectedTags } = this;
      const tagI = temporarilySelectedTags.indexOf(tag.id);
      if (tagI === -1) {
        temporarilySelectedTags.push(tag.id);
      } else {
        temporarilySelectedTags.splice(tagI, 1);
      }

      this.applyFilters();
    },
    isTagSelected (tag) {
      const tagId = tag.id;
      if (this.temporarilySelectedTags.indexOf(tagId) !== -1) return true;
      return false;
    },
    openBuyDialog (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
  },
};
</script>
