<template lang="pug">
.row.user-tasks-page
  broken-task-modal
  task-modal(
    :task="editingTask || creatingTask",
    :purpose="creatingTask !== null ? 'create' : 'edit'",
    @cancel="cancelTaskModal()",
    ref="taskModal",
  )
  .col-12
    .row.tasks-navigation
      .col-12.col-md-4.offset-md-4
        .d-flex
          input.form-control.input-search(type="text", :placeholder="$t('search')", v-model="searchText")
          button.btn.btn-secondary.dropdown-toggle.ml-2.d-flex.align-items-center.search-button(
            type="button",
            @click="toggleFilterPanel()",
            :class="{active: selectedTags.length > 0}",
          )
            .svg-icon.filter-icon.mr-2(v-html="icons.filter")
            span(v-once) {{ $t('tags') }}
        .filter-panel(v-if="isFilterPanelOpen", v-on:mouseleave="checkMouseOver")
          .tags-category.d-flex(
            v-for="tagsType in tagsByType",
            v-if="tagsType.tags.length > 0 || tagsType.key === 'tags'",
            :key="tagsType.key"
          )
            .tags-header
              strong(v-once) {{ $t(tagsType.key) }}
              a.d-block(v-if="tagsType.key !== 'groups' && !editingTags", @click="editTags(tagsType.key)") {{ $t('editTags2') }}
            .tags-list.container
              .row(:class="{'no-gutters': !editingTags}")
                template(v-if="editingTags && tagsType.key === 'tags'")
                  draggable(
                    v-if="tagsType.key === 'tags'",
                    v-model="tagsSnap[tagsType.key]",
                    class="row"
                  )
                    .col-6(v-for="(tag, tagIndex) in tagsSnap[tagsType.key]")
                      .inline-edit-input-group.tag-edit-item.input-group
                        .svg-icon.inline.drag(v-html="icons.drag")
                        input.tag-edit-input.inline-edit-input.form-control(type="text", v-model="tag.name")
                        .input-group-append(@click="removeTag(tagIndex, tagsType.key)")
                          .svg-icon.destroy-icon(v-html="icons.destroy")

                    .col-6.dragSpace
                      input.new-tag-item.edit-tag-item.inline-edit-input.form-control(type="text", :placeholder="$t('newTag')", @keydown.enter="addTag($event, tagsType.key)", v-model="newTag")
                template(v-if="editingTags && tagsType.key === 'challenges'")
                    .col-6(v-for="(tag, tagIndex) in tagsSnap[tagsType.key]")
                      .inline-edit-input-group.tag-edit-item.input-group
                        input.tag-edit-input.inline-edit-input.form-control(type="text", v-model="tag.name")
                        .input-group-append(@click="removeTag(tagIndex, tagsType.key)")
                          .svg-icon.destroy-icon(v-html="icons.destroy")

                template(v-if="!editingTags || tagsType.key === 'groups'")
                  .col-6(v-for="(tag, tagIndex) in tagsType.tags")
                    .custom-control.custom-checkbox
                      input.custom-control-input(
                        type="checkbox",
                        :checked="isTagSelected(tag)",
                        @change="toggleTag(tag)", :id="`tag-${tag.id}`"
                      )
                      label.custom-control-label(v-markdown='tag.name', :for="`tag-${tag.id}`")

          .filter-panel-footer.clearfix
            template(v-if="editingTags === true")
              .text-center
                a.mr-3.btn-filters-primary(@click="saveTags()", v-once) {{ $t('saveEdits') }}
                a.btn-filters-secondary(@click="cancelTagsEditing()", v-once) {{ $t('cancel') }}
            template(v-else)
              .float-left
                a.btn-filters-danger(@click="resetFilters()", v-once) {{ $t('resetFilters') }}
              .float-right
                a.btn-filters-secondary(@click="closeFilterPanel()", v-once) {{ $t('cancel') }}
      .create-task-area.d-flex
        transition(name="slide-tasks-btns")
          .d-flex(v-if="openCreateBtn")
            .create-task-btn.diamond-btn(
              v-for="type in columns",
              :key="type",
              @click="createTask(type)",
              v-b-tooltip.hover.bottom="$t(type)",
            )
              .svg-icon(v-html="icons[type]", :class='`icon-${type}`')

        #create-task-btn.create-btn.diamond-btn.btn.btn-success(
          @click="openCreateBtn = !openCreateBtn",
          :class="{open: openCreateBtn}",
        )
          .svg-icon(v-html="icons.positive")
        b-tooltip(target="create-task-btn", placement="bottom", v-if="!openCreateBtn") {{ $t('addTaskToUser') }}

    .row.tasks-columns
      task-column.col-lg-3.col-md-6(
        v-for="column in columns",
        :type="column", :key="column",
        :isUser="true", :searchText="searchTextThrottled",
        :selectedTags="selectedTags",
        @editTask="editTask",
        @openBuyDialog="openBuyDialog($event)"
      )

  spells
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/create-task.scss';

  .user-tasks-page {
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
      background-image: url(~client/assets/svg/for-css/positive.svg);
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
import TaskColumn from './column';
import TaskModal from './taskModal';
import spells from './spells';
import markdown from 'client/directives/markdown';

import positiveIcon from 'assets/svg/positive.svg';
import filterIcon from 'assets/svg/filter.svg';
import deleteIcon from 'assets/svg/delete.svg';
import habitIcon from 'assets/svg/habit.svg';
import dailyIcon from 'assets/svg/daily.svg';
import todoIcon from 'assets/svg/todo.svg';
import rewardIcon from 'assets/svg/reward.svg';
import dragIcon from 'assets/svg/drag_indicator.svg';

import uuid from 'uuid';
import Vue from 'vue';
import throttle from 'lodash/throttle';
import cloneDeep from 'lodash/cloneDeep';
import { mapState, mapActions } from 'client/libs/store';
import taskDefaults from 'common/script/libs/taskDefaults';
import brokenTaskModal from './brokenTaskModal';

import Item from 'client/components/inventory/item.vue';
import draggable from 'vuedraggable';

export default {
  components: {
    TaskColumn,
    TaskModal,
    Item,
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
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  methods: {
    ...mapActions({setUser: 'user:set'}),
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
      this.tagsSnap[key].push({id: uuid.v4(), name: this.newTag});
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

      this.setUser({tags: this.tagsSnap.tags.concat(this.tagsSnap.challenges)});
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
      this.creatingTask = taskDefaults({type, text: ''}, this.user);
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
      const temporarilySelectedTags = this.temporarilySelectedTags;
      this.selectedTags = temporarilySelectedTags.slice();
    },
    toggleTag (tag) {
      const temporarilySelectedTags = this.temporarilySelectedTags;
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
