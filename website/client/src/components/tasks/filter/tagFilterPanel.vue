<template>
  <div class="filter-panel" @mouseleave="closePanel">
    <header class="filter-panel-footer clearfix">
      <span v-once class="svg-icon inline" v-html="icons.tags"></span>
      <h1 v-once class="inline">{{ $t('tags') }}</h1>
      <button v-if="editingTags" class="btn btn-primary float-right" @click="saveTags">
        {{ $t('saveEdits') }}
      </button>
      <a
        v-else
        class="reset-filters float-right"
        :class="{ 'disabled': !selectedTags.length }"
        @click="filter([])"
      >{{ $t('resetFilters') }}</a>
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
          <tag-filter-button
            v-for="tag in tagsType.tags"
            :key="tag.id"
            :selected="isSelected(tag)"
            :editable="isEditable(tag)"
            :draggable="isDraggable(tagsType.key)"
            :tag="tag"
            @toggle="toggleTag"
            @remove="removeTag"
          />
        </draggable>
        <input
          v-if="editingTags && tagsType.key == 'tags'"
          v-model="newTag"
          class="new-tag-item edit-tag-item form-control col-6"
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

  header {
    padding: 8px 16px;
    border-bottom: 1px solid $gray-500;

    .svg-icon {
      margin: auto;
      height: 14px;
      width: 14px;
      padding-top: 3px;
      color: $gray-200
    }

    h1 {
      color: $gray-10;
      margin: 9px;
    }

    a {
      padding: 4px 16px;

      &:not(.disabled) {
        &:focus, &:hover, &:active {
          text-decoration: underline;
        }
      }
    }

    .reset-filters {
      color: $maroon-50;
      padding-left: 0;

      &.disabled {
        color: $gray-50;
        cursor: default;
      }
    }

    .btn-primary {
      margin-top: -2px;
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
    }

    &:first-of-type {
      padding-top: 4px;
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

import TagFilterButton from './tagFilterButton';

import tagsIcon from '@/assets/svg/tags.svg';

import { mapState, mapActions } from '@/libs/store';

export default {
  components: {
    TagFilterButton,
    draggable,
  },
  props: { selectedTags: Array },
  data () {
    return {
      icons: Object.freeze({
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
