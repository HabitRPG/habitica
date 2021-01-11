<template>
  <div class="filter-panel" @mouseleave="checkMouseOver">
    <!-- eslint-disable vue/no-use-v-if-with-v-for -->
    <div
      v-for="tagsType in tagsByType"
      v-if="tagsType.tags.length > 0 || tagsType.key === 'tags'"
      :key="tagsType.key"
      class="tags-category d-flex flex-column"
    >
      <!-- eslint-enable vue/no-use-v-if-with-v-for -->
      <div class="tags-header">
        <strong v-once>{{ $t(tagsType.key) }}</strong>
        <a
          v-if="tagsType.key !== 'groups' && !editingTags"
          class="d-block"
          @click="editTags(tagsType.key)"
          >{{ $t("editTags2") }}</a
        >
      </div>
      <div class="tags-list container">
        <div class="row" :class="{ 'no-gutters': !editingTags }">
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
                  <div class="svg-icon inline drag" v-html="icons.drag"></div>
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
            <div v-for="tag in tagsType.tags" :key="tag.id" class="col-6">
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
          <a v-once class="mr-3 btn-filters-primary" @click="saveTags()">{{
            $t("saveEdits")
          }}</a>
          <a
            v-once
            class="btn-filters-secondary"
            @click="cancelTagsEditing()"
            >{{ $t("cancel") }}</a
          >
        </div>
      </template>
      <template v-else>
        <div class="float-left">
          <a v-once class="btn-filters-danger" @click="resetFilters()">{{
            $t("resetFilters")
          }}</a>
        </div>
        <div class="float-right">
          <a v-once class="btn-filters-secondary" @click="closePanel()">{{
            $t("cancel")
          }}</a>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .filter-panel {
    position: absolute;
    padding-left: 24px;
    padding-right: 24px;
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

    .tags-category {
      border-bottom: 1px solid $gray-600;
      padding-bottom: 24px;
      padding-top: 24px;
    }

    .tags-header {
      flex-basis: 60px;
      flex-shrink: 0;
      margin-left: 10px;

      a {
        font-size: 12px;
        line-height: 1.33;
        color: $blue-10;
        margin-top: 4px;

        &:focus,
        &:hover,
        &:active {
          text-decoration: underline;
        }
      }
    }

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
        &:focus,
        &:hover,
        &:active {
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

  .drag {
    cursor: grab;
    margin: auto 0;
    height: 20px;
    width: 20px;

    color: $gray-400;

    &:hover {
      color: $gray-200;
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
import { v4 as uuid } from 'uuid';
import { xor, throttle } from 'lodash';
import draggable from 'vuedraggable';

import markdown from '@/directives/markdown';
import deleteIcon from '@/assets/svg/delete.svg';
import dragIcon from '@/assets/svg/drag_indicator.svg';

import { mapState, mapActions } from '@/libs/store';

export default {
  components: {
    draggable,
  },
  directives: {
    markdown,
  },
  props: {
    selectedTags: Array,
  },
  data () {
    return {
      icons: Object.freeze({
        destroy: deleteIcon,
        drag: dragIcon,
      }),
      tagsSnap: {
        tags: [],
        challenges: [],
      }, // tags snapshot when being edited
      editingTags: false,
      newTag: null,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    tagsByType () {
      return {
        challenges: {
          key: 'challenges',
          tags: this.user.tags.filter(t => t.challenge),
        },
        groups: {
          key: 'groups',
          tags: this.user.tags.filter(t => t.group),
        },
        user: {
          key: 'tags',
          tags: this.user.tags.filter(t => !t.group && !t.challenge),
        },
      };
    },
  },
  methods: {
    ...mapActions({ setUser: 'user:set' }),
    checkMouseOver: throttle(function throttleClose () {
      if (!this.editingTags) this.closePanel();
    }, 250),
    toggleTag (tag) {
      this.selectedTags = xor(this.selectedTags, [tag.id]);
      this.applyFilters();
    },
    isTagSelected (tag) {
      return this.selectedTags.includes(tag.id);
    },
    removeTag (index, key) {
      const tagId = this.tagsSnap[key][index].id;
      const indexInSelected = this.selectedTags.indexOf(tagId);
      if (indexInSelected !== -1) {
        this.$delete(this.selectedTags, indexInSelected);
      }
      this.$delete(this.tagsSnap[key], index);
      this.applyFilters();
    },
    editTags () {
      // clone the arrays being edited so that we can revert if needed
      this.tagsSnap.tags = this.tagsByType.user.tags.slice();
      this.tagsSnap.challenges = this.tagsByType.challenges.tags.slice();
      this.editingTags = true;
    },
    addTag (eventObj, key) {
      this.tagsSnap[key].push({ id: uuid(), name: this.newTag });
      this.newTag = null;
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
    applyFilters () {
      this.$emit('filter', this.selectedTags);
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
