<template>
  <div>
    <b-dropdown
      class="inline-dropdown select-tag"
      @show="wasOpened()"
      @hide="hideCallback($event)"
      @toggle="openOrClose($event)"
      :toggle-class="isOpened ? 'active' : null"
      ref="dropdown"
    >
      <b-dropdown-header>
        <div class="mb-2">
          <b-form-input type="text"
                        :placeholder="searchPlaceholder"
                        v-model="search"
                        @keyup.enter="handleSubmit"
          />
        </div>

        <tag-list v-if="selectedTags.length > 0"
                  :add-new="addNew"
                  :tags="selectedTagsAsObjects"
                  @remove-tag="removeTag($event)"
                  :max-tags="0" />

      </b-dropdown-header>
      <template v-slot:button-content>
        <tag-list :tags="selectedTagsAsObjects"
                  :add-new="addNew"
                  :empty-message="emptyMessage"
                  @remove-tag="removeTag($event)"/>
      </template>
      <div
        v-if="addNew || availableToSelect.length > 0"
        :class="{
          'item-group': true,
          'add-new': availableToSelect.length === 0 && search !== '',
          'scroll': availableToSelect.length > 5
        }"
      >
        <b-dropdown-item-button
          v-for="tag in availableToSelect"
          :key="tag.id"
          @click.prevent.stop="selectTag(tag)"
          class="ignore-hide tag-item"
          :class="{ 'none': tag.id === 'none', selectListItem: true }"
        >
          <div class="label" v-markdown="tag.name"></div>
          <div class="challenge" v-if="tag.challenge">{{$t('challenge')}}</div>
        </b-dropdown-item-button>

        <div v-if="addNew" class="hint">
          {{$t('pressEnterToAddTag', { tagName: search })}}
        </div>
      </div>
    </b-dropdown>

  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  $itemHeight: 2rem;

  .select-tag {
    .dropdown-toggle {
      padding-left: 0.75rem;
    }

    .dropdown-header {
      background-color: $gray-700;
      padding-bottom: 0;
      min-height: 3rem;
    }

    .dropdown-item, .dropdown-header {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }

    .none {
      cursor: default;
      pointer-events: none;
    }

    .tag-item button {
      height: $itemHeight;
      display: flex;

      .label {
        height: 1.5rem;
        font-size: 14px;
        line-height: 1.71;
        flex: 1;
      }

      .challenge {
        height: 1rem;
        font-size: 12px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.33;
        letter-spacing: normal;
        text-align: right;
        color: $gray-100;
        align-self: center;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        margin-right: 0.25rem;
      }

      &:hover {
        .challenge {
          color: $purple-300;
        }
      }
    }

    .item-group {
      max-height: #{5*$itemHeight};

      &.add-new {
        height: 30px;

        .hint {
          display: block;
        }
      }
      &.scroll {
        overflow-y: scroll;
      }
    }

    .hint {
      display: none;
      height: 2rem;
      font-size: 12px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.33;
      letter-spacing: normal;
      color: $gray-100;

      margin-left: 0.75rem;
      margin-top: 0.5rem;
    }
  }

</style>

<script>
import Vue from 'vue';
import TagList from '@/components/tasks/modal-controls/tagList';
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  components: {
    TagList,
  },
  data () {
    return {
      preventHide: true,
      isOpened: false,
      showTagsSelect: false,
      selected: this.selectedTags,
      search: '',
    };
  },
  methods: {
    closeTagsPopup () {
      this.preventHide = false;
      this.isOpened = false;
      Vue.nextTick(() => {
        this.$refs.dropdown.hide();
      });
    },
    openOrClose ($event) {
      if (this.isOpened) {
        this.closeTagsPopup();
        $event.preventDefault();
      }
    },
    closeIfOpen () {
      this.closeTagsPopup();
    },
    selectTag (tag) {
      this.selectedTags.push(tag.id);
      this.$emit('toggle', tag.id);
    },
    removeTag ($event) {
      const foundIndex = this.selectedTags.findIndex(t => t === $event);

      this.selectedTags.splice(foundIndex, 1);

      this.$emit('toggle', $event);
    },
    hideCallback ($event) {
      if (this.preventHide) {
        $event.preventDefault();
        return;
      }

      this.isOpened = false;
    },
    wasOpened () {
      this.isOpened = true;
      this.preventHide = true;
    },
    handleSubmit () {
      if (!this.addNew) return;
      const { search } = this;
      this.$emit('addNew', search);

      this.search = '';
    },
  },
  computed: {
    selectedTagsIdList () {
      return this.selectedTags
        ? this.selectedTags.map(t => t)
        : [];
    },
    allTagsMap () {
      const obj = {};
      this.allTags.forEach(t => {
        obj[t.id] = t;
      });
      return obj;
    },
    selectedTagsAsObjects () {
      return this.selectedTags.map(t => this.allTagsMap[t]);
    },
    availableToSelect () {
      const availableItems = this.allTags.filter(t => !this.selectedTagsIdList.includes(t.id));

      const searchString = this.search.toLowerCase();

      const filteredItems = availableItems.filter(i => i.name.toLowerCase().includes(searchString));

      return filteredItems;
    },
  },
  props: {
    addNew: {
      type: Boolean,
      default: false,
    },
    allTags: {
      type: Array,
    },
    emptyMessage: {
      type: String,
    },
    searchPlaceholder: {
      type: String,
    },
    selectedTags: {
      type: Array,
    },
  },
  watch: {
    selected () {
      this.$emit('changed', this.selected);
    },
  },
  mounted () {
    this.$refs.dropdown.clickOutHandler = () => {
      this.closeTagsPopup();
    };
  },
};
</script>
