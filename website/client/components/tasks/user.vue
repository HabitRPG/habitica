<template lang="pug">
.row.user-tasks-page
  task-modal(
    :task="editingTask || creatingTask",
    :purpose="creatingTask !== null ? 'create' : 'edit'",
    @cancel="cancelTaskModal()",
    ref="taskModal",
  )
  .col-12
    .row.tasks-navigation
      .col-4.offset-4
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
                        span.custom-control-description(v-markdown='tag.name')

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
              span.svg-icon.inline(v-html="icons[type]", :class='`icon_${type}`')
              span.text {{$t(type)}}

    .row.tasks-columns
      task-column.col-3(
        v-for="column in columns",
        :type="column", :key="column",
        :isUser="true", :searchText="searchTextThrottled",
        :selectedTags="selectedTags",
        @editTask="editTask",
        @openBuyDialog="openBuyDialog($event)"
      )

  spells
</template>

<style lang="scss">
  #create-dropdown .dropdown-toggle::after {
    display: none;
  }
</style>

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
    color: #C3C0C7;
  }

  .dropdown-icon-item {
      .icon_habit {
        width: 30px;
        height: 20px;
      }

      .icon_daily {
        width: 24px;
        height: 20px;
      }

      .icon_todo {
        width: 20px;
        height: 20px;
      }

      .icon_reward {
        width: 26px;
        height: 20px;
      }
  }

  .dropdown-icon-item:hover .svg-icon, .dropdown-item.active .svg-icon {
    color: #4f2a93;
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

      &:focus, &:focus ~ .input-group-btn {
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
      .input-group-btn {
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

    .custom-control-description {
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

import uuid from 'uuid';
import Vue from 'vue';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import throttle from 'lodash/throttle';
import cloneDeep from 'lodash/cloneDeep';
import { mapState, mapActions } from 'client/libs/store';
import taskDefaults from 'common/script/libs/taskDefaults';

import Item from 'client/components/inventory/item.vue';

export default {
  components: {
    TaskColumn,
    TaskModal,
    bDropdown,
    bDropdownItem,
    Item,
    spells,
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
      icons: Object.freeze({
        positive: positiveIcon,
        filter: filterIcon,
        destroy: deleteIcon,
        habit: habitIcon,
        daily: dailyIcon,
        todo: todoIcon,
        reward: rewardIcon,
      }),
      selectedTags: [],
      temporarilySelectedTags: [],
      tagsSnap: null, // tags snapshot when being edited
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
      this.searchTextThrottled = this.searchText;
    }, 250),
  },
  methods: {
    ...mapActions({setUser: 'user:set'}),
    editTags () {
      // clone the arrays being edited so that we can revert if needed
      this.tagsSnap = this.tagsByType.user.tags.slice();
      this.editingTags = true;
    },
    addTag () {
      this.tagsSnap.push({id: uuid.v4(), name: this.newTag});
      this.newTag = null;
    },
    removeTag (index) {
      this.tagsSnap.splice(index, 1);
    },
    saveTags () {
      this.setUser({tags: this.tagsSnap});
      this.cancelTagsEditing();
    },
    cancelTagsEditing () {
      this.editingTags = false;
      this.tagsSnap = null;
      this.newTag = null;
    },
    editTask (task) {
      this.editingTask = cloneDeep(task);
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('show::modal', 'task-modal');
      });
    },
    createTask (type) {
      this.creatingTask = taskDefaults({type, text: ''});
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('show::modal', 'task-modal');
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
    openBuyDialog (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
  },
};
</script>
