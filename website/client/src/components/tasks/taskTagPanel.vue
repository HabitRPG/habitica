<template>
  <div class="filter-panel" @mouseleave="checkMouseOver">
    <header class="filter-panel-footer clearfix">
      <span v-once class="svg-icon inline" v-html="icons.tags"></span>
      <strong v-once>{{ $t('tags') }}</strong>
      <a
        class="float-right"
        :class="{'btn-filters-danger': !editingTags, 'btn-primary': editingTags}"
        @click="editingTags ? saveTags() : resetFilters()"
      >{{ $t(editingTags ? 'saveEdits' : 'resetFilters') }}</a>
      <a class="btn-filters-secondary float-right" @click="toggleEditing">
        {{ $t(editingTags ? 'cancel' : 'editTags2') }}
      </a>
    </header>
    <main>
      <section
        v-for="tagsType in nonEmptyTags"
        :key="tagsType.key"
        class="tags-category d-flex flex-column"
        :class="tagsType.key"
      >
        <header class="tags-header" v-once>{{ $t(tagsType.key) }}</header>
        <draggable
          v-model="tagsType.tags"
          class="row"
          :disabled="!isDraggable(tagsType.key)"
        >
          <div
            v-for="tag in tagsType.tags"
            :key="tag.id"
            class="col-6 d-flex tag"
            :class="{ editable: isEditable(tag), draggable: isDraggable(tagsType.key) }"
          >
            <span class="svg-icon inline drag-handle" v-html="icons.drag"></span>
            <input
              type="checkbox"
              :checked="isTagSelected(tag)"
              @change="toggleTag(tag)"
              :disabled="isEditable(tag)"
            >
            <input
              v-model="tag.name"
              class="tag-edit-input inline-edit-input form-control"
              type="text"
              :disabled="!isEditable(tag)"
            >
            <span class="svg-icon inline" v-html="icons.destroy" @click="removeTag(tag)"></span>
          </div>
        </draggable>
        <input
          v-model="newTag"
          class="new-tag-item edit-tag-item inline-edit-input form-control"
          type="text"
          :placeholder="$t('newTag')"
          @keydown.enter="addTag"
        >
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .filter-panel {
    position: absolute;
    max-width: 50vw;
    min-width: 300px;
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

    .tag-edit-input {
      border-bottom: 1px solid $gray-500 !important;

      &:focus,
      &:focus ~ .input-group-append {
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
    }
  }

  .svg-icon {
    margin: auto;
  }

  header {
    padding: 16px 12px;
    border-bottom: 1px solid $gray-500;

    .svg-icon {
      height: 14px;
      width: 14px;
    }

    a {
      padding: 4px 16px;

      &:focus,
      &:hover,
      &:active {
        text-decoration: underline;
      }
    }

    .btn-filters-danger {
      color: $red-50;
    }

    .btn-primary {
      color: $white;
    }

    .btn-filters-secondary {
      color: $gray-300;
    }
  }

  main {
    padding: 16px;
  }

  section {
    border-bottom: 1px solid $gray-600;

    header {
      padding: 0;
    }

    &:not(.tags) .new-tag-item {
      display: none;
    }
  }

  .drag-handle {
    cursor: grab;

    color: $gray-400;

    &:hover {
      color: $gray-200;
    }
  }

  .tag {
    input:disabled {
      opacity: 1;
      background-color: transparent;
    }

    &.editable {
      input[type="checkbox"] {
        display: none;
      }

      .svg-icon {
        display: none;
        height: 16px;
        width: 16px;
      }

      .svg-icon.drag-handle {
        width: 24px;
      }

      &:hover .svg-icon {
        display: inline;
      }
    }

    &:not(.draggable) .svg-icon.drag-handle {
      &,&:hover {
        display: none;
      }
    }
  }

  @media only screen and (max-width: 768px) {
    .filter-panel {
      max-width: none;
      left: 0px;
    }
  }
</style>


<script>
import { v4 as uuid } from 'uuid';
import { xor, throttle } from 'lodash';
import draggable from 'vuedraggable';

import deleteIcon from '@/assets/svg/delete.svg';
import dragIcon from '@/assets/svg/drag_indicator.svg';
import tagsIcon from '@/assets/svg/tags.svg';

import { mapState, mapActions } from '@/libs/store';

export default {
  components: { draggable },
  props: { selectedTags: Array },
  data () {
    return {
      icons: Object.freeze({
        destroy: deleteIcon,
        drag: dragIcon,
        tags: tagsIcon,
      }),
      editingTags: false,
      newTag: null,
      tags: null,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    nonEmptyTags () {
      const { tags } = this;
      return tags
        ? [...[tags.challenges, tags.groups].filter(type => type.tags.length), tags.user]
        : [];
    },
  },
  created () {
    this.resetTags();
  },
  methods: {
    ...mapActions({ setUser: 'user:set' }),
    checkMouseOver: throttle(function throttleClose () {
      if (false && !this.editingTags) this.closePanel();
    }, 250),
    toggleTag (tag) {
      this.$emit('filter', xor(this.selectedTags, [tag.id]));
    },
    isTagSelected (tag) {
      return this.selectedTags.includes(tag.id);
    },
    isEditable (tag) {
      return this.editingTags && !tag.group;
    },
    isDraggable (tagsTypeKey) {
      return this.editingTags && tagsTypeKey === 'tags';
    },
    removeTag (tag) {
      if (this.isTagSelected(tag)) {
        this.toggleTag(tag);
      }
      const tagType = tag.challenge ? this.tags.challenges : this.tags.user;
      tagType.tags = tagType.tags.filter(t => t !== tag);
    },
    toggleEditing () {
      this.resetTags();
      this.editingTags = !this.editingTags;
    },
    addTag () {
      this.tags.user.tags.push({ id: uuid(), name: this.newTag });
      this.newTag = null;
    },
    saveTags () {
      if (this.newTag) this.addTag(null, 'tags');
      const tags = [...this.tags.user.tags, ...this.tags.challenges.tags];
      this.setUser({ tags });
      this.toggleEditing();
    },
    resetTags () {
      const allTags = this.user.tags;
      function groupTags (key, filter) {
        return { key, tags: allTags.filter(filter) };
      }

      const challenges = groupTags('challenges', t => t.challenge);
      const groups = groupTags('groups', t => t.group);
      const user = groupTags('tags', t => !t.group && !t.challenge);
      this.tags = { challenges, groups, user };
    },
    resetFilters () {
      this.$emit('filter', []);
    },
    closePanel () {
      this.$emit('close');
    },
  },
};
</script>
