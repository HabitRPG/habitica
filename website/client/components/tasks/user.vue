<template lang="pug">
.row.user-tasks-page
  edit-task-modal(:task="editingTask", ref="editTaskModal")
  .col-12
    .row.tasks-navigation
      .col-4.offset-4
        .input-group
          input.form-control.input-search(type="text", :placeholder="$t('search')", v-model="searchText")
          .filter-panel(v-if="isFilterPanelOpen")
            .tags-category.d-flex(v-for="tagsType in tagsByType", v-if="tagsType.tags.length > 0", :key="tagsType.key")
              .tags-header(v-once) 
                strong {{ $t(tagsType.key) }}
                a.d-block(v-if="tagsType.key === 'tags'", v-once) {{ $t('editTags2') }} 
              .tags-list.container
                .row.no-gutters
                  .col-6(v-for="tag in tagsType.tags",)
                    label.custom-control.custom-checkbox
                      input.custom-control-input(
                        type="checkbox", 
                        :checked="isTagSelected(tag)", 
                        @change="toggleTag(tag)",
                      )
                      span.custom-control-indicator
                      span.custom-control-description {{ tag.name }}

            .filter-panel-footer.clearfix
              .float-left
                a.reset-filters(@click="resetFilters()", v-once) {{ $t('resetFilters') }}
              .float-right
                a.mr-3.apply-filters(@click="applyFilters()", v-once) {{ $t('applyFilters') }}
                a.cancel-filters(@click="closeFilterPanel()", v-once) {{ $t('cancel') }}
          span.input-group-btn
            button.btn.btn-secondary.filter-button(
              type="button", 
              @click="toggleFilterPanel()",
              :class="{'filter-button-open': selectedTags.length > 0}",
            )
              .d-flex.align-items-center
                span(v-once) {{ $t('filter') }}
                .svg-icon.filter-icon(v-html="icons.filter")
      .col-1.offset-3
        button.btn.btn-success(v-once) 
          .svg-icon.positive(v-html="icons.positive")
          | {{ $t('create') }}
    .row.tasks-columns
      task-column.col-3(
        v-for="column in columns", 
        :type="column", :key="column", 
        :isUser="true", :searchText="searchTextThrottled",
        :selectedTags="selectedTags",
        @editTask="editTask",
      )
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

    .reset-filters {
      color: $red-50;
    }

    .apply-filters {
      color: $blue-10;
    }

    .cancel-filters {
      color: $gray-300;
    }
  }
}
</style>

<script>
import TaskColumn from './column';
import EditTaskModal from './editTaskModal';

import positiveIcon from 'assets/svg/positive.svg';
import filterIcon from 'assets/svg/filter.svg';

import Vue from 'vue';
import throttle from 'lodash/throttle';
import { mapState } from 'client/libs/store';

export default {
  components: {
    TaskColumn,
    EditTaskModal,
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
      }),
      selectedTags: [],
      temporarilySelectedTags: [],
      editingTask: null,
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
    editTask (task) {
      this.editingTask = task;
      // Necessary otherwise the first time the modal is not rendered
      Vue.nextTick(() => {
        this.$root.$emit('show::modal', 'edit-task-modal');
      });
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
