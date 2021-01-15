<template>
  <div class="filter-panel" @mouseleave="closePanel">
    <header class="filter-panel-footer clearfix">
      <span v-once class="svg-icon inline" v-html="icons.tags"></span>
      <h1 v-once class="inline">{{ $t('tags') }}</h1>
      <a
        class="float-right"
        :class="{
          'disabled-selection': !editingTags && !selectedTags.length,
          'clear-selection': !editingTags && selectedTags.length,
          'btn-primary': editingTags,
          }"
        @click="editingTags ? saveTags() : filter([])"
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
        <h2 class="tags-header" v-once>{{ $t(tagsType.key) }}</h2>
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
              :checked="isSelected(tag)"
              @change="toggleTag(tag)"
              :disabled="isEditable(tag)"
            >
            <input
              v-model="tag.name"
              type="text"
              :disabled="!isEditable(tag)"
            >
            <a class="svg-icon inline" v-html="icons.destroy" @click="removeTag(tag)"></a>
          </div>
        </draggable>
        <input
          v-if="editingTags"
          v-model="newTag"
          class="new-tag-item edit-tag-item form-control"
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
    max-width: 448px;
    min-width: 300px;
    width: 100%;
    z-index: 9999;
    font-size: 14px;
    background: $white;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
    top: 44px;
    left: 20vw;
    line-height: 1.43;
    text-overflow: ellipsis;
  }

  h1, h2 {
    font: bold 14px "Roboto", sans-serif;
  }

  input {
    // Necessary to prevent "Dark line flash" when editing
    border-color: $gray-500 !important;
  }

  .svg-icon {
    color: $gray-200
  }

  header {
    padding: 8px 16px;
    border-bottom: 1px solid $gray-500;

    .svg-icon {
      margin: auto;
      height: 14px;
      width: 14px;
      padding-top: 3px;
    }

    h1 {
      color: $gray-10;
      margin: 9px;
    }

    a {
      padding: 4px 16px;

      &:not(.disabled-selection) {
        &:focus, &:hover, &:active {
          text-decoration: underline;
        }
      }
    }

    .clear-selection {
      color: $maroon-50;
      padding-left: 0;
    }

    .disabled-selection {
      color: $gray-50;
      cursor: default;
      padding-left: 0;
    }

    .btn-primary {
      color: $white;
      font-weight: bold;
    }

    .btn-filters-secondary {
      color: $wizard-color;
    }
  }

  main {
    padding: 16px;
  }

  section {
    padding-top: 12px;

    h2 {
      color: $gray-100;
      padding: 0;
      margin: 0;
    }

    &:not(.tags) {
      padding-bottom: 6px;
      border-bottom: 1px solid $gray-500;

      .new-tag-item {
        display: none;
      }
    }

    &:first-of-type {
      padding-top: 4px;
    }
  }

  .tag {
    margin: 4px 0;

    .drag-handle {
      cursor: grab;
      top: 2px;
      left: 6px;
      width: 24px;
      color: $gray-400;

      &:hover {
        color: $gray-200;
      }
    }

    input:disabled {
      opacity: 1;
      background-color: transparent;
    }

    input[type=checkbox] {
      margin: auto 7px;
    }

    input[type=text] {
      cursor: text;
      border: none;
      padding: 0;
      padding-left: 5px;
      height: 1.71rem;
      width: 100%;
    }

    &.editable {
      padding-left: 38px;

      input[type="checkbox"] {
        display: none;
      }

      input[type="text"] {
        border-bottom: 1px solid $gray-500;

        &:focus {
          border-color: $purple-500 !important;
        }
      }

      .svg-icon {
        display: none;
        position: absolute;
      }

      a.svg-icon {
        top: 5px;
        right: 12px;
        width: 16px;
      }

      &:hover .svg-icon {
        display: block;
      }
    }

    &:not(.draggable) .svg-icon.drag-handle {
      &,&:hover {
        display: none;
      }
    }
  }

  .new-tag-item {
    width: 100%;
    background-repeat: no-repeat;
    background-position: center left 10px;
    border: none;
    border-bottom: 1px solid $gray-500;
    background-size: 10px 10px;
    padding-left: 40px;
    background-image: url(~@/assets/svg/for-css/positive.svg);

    &:focus {
      border-color: $purple-500 !important;
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
import xor from 'lodash/xor';
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
    closePanel () {
      if (!this.editingTags) this.$emit('close');
    },
    filter (tags) {
      this.$emit('filter', tags);
    },
    toggleTag (tag) {
      this.filter(xor(this.selectedTags, [tag.id]));
    },
    isSelected (tag) {
      return this.selectedTags.includes(tag.id);
    },
    isEditable (tag) {
      return this.editingTags && !tag.group;
    },
    isDraggable (tagsTypeKey) {
      return this.editingTags && tagsTypeKey === 'tags';
    },
    removeTag (tag) {
      if (this.isSelected(tag)) this.toggleTag(tag);

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
      if (this.newTag) this.addTag();
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
  },
};
</script>
