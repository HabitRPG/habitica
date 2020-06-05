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
                        :placeholder="$t('enterTag')"
                        v-model="search"
          />
        </div>

        <tagList v-if="selectedTags.length > 0"
                 :tags="selectedTagsAsObjects"
                 @remove-tag="removeTag($event)"
                 :max-tags="0" />

      </b-dropdown-header>
      <template v-slot:button-content>
        <tag-list :tags="selectedTagsAsObjects"
                  @remove-tag="removeTag($event)"/>
      </template>
      <div class="item-group">
        <b-dropdown-item-button
          v-for="tag in availableToSelect"
          :key="tag.id"
          @click.prevent.stop="selectTag(tag)"
          class="ignore-hide tag-item py-0"
          :class="{ 'none': tag.id === 'none' }"
        >
          <div class="label mt-1 mb-1" v-markdown="tag.name"></div>
        </b-dropdown-item-button>
      </div>
    </b-dropdown>

  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

</style>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  $itemHeight: 2rem;

  .select-tag {
    .dropdown-toggle {
      padding-left: 0.5rem;
    }

    .dropdown-header {
      background-color: $gray-700;
      padding-bottom: 0;
      min-height: 3rem;
    }

    .dropdown-item {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
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

      .label {
        height: 1.5rem;
        font-size: 14px;
        line-height: 1.71;
      }
    }

    .item-group {
      max-height: #{5*$itemHeight};
      overflow-y: scroll;
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
    },
    removeTag ($event) {
      const foundIndex = this.selectedTags.findIndex(t => t === $event);

      this.selectedTags.splice(foundIndex, 1);
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
    selectedTags: {
      type: Array,
    },
    allTags: {
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
