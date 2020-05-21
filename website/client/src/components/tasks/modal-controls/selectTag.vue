<template>
  <div>
    <b-dropdown
      class="inline-dropdown select-tag"
      @show="wasOpened()"
      @hide="hideCallback($event)"
      :toggle-class="isOpened ? 'active' : null"
      :disabled="disabled"
      ref="dropdown"
    >
      <b-dropdown-header>
        <b-form-input
                type="text"
                placeholder="Search"
                v-model="search"
        />

        <tagList v-if="selectedTags.length > 0"
                 :tags="selectedTagsAsObjects"
                 @remove-tag="removeTag($event)"
                 class="mt-2"
                 :max-tags="0" />

      </b-dropdown-header>
      <template v-slot:button-content>
        <tag-list :tags="selectedTagsAsObjects"
                  @remove-tag="removeTag($event)"/>
      </template>
      <b-dropdown-item-button
        v-for="tag in availableToSelect"
        :key="tag.id"
        @click.prevent.stop="selectTag(tag)"
        class="ignore-hide"
        :class="{ 'none': tag.id === 'none' }"
      >
        {{ tag.name }}
      </b-dropdown-item-button>
    </b-dropdown>

  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

</style>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .select-tag {
    .dropdown-header {
      background-color: $gray-700;
    }

    .dropdown-item, .dropdown-header {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }

    .none {
      cursor: default;
      pointer-events: none;
    }
  }

</style>

<script>
import TagList from '@/components/tasks/modal-controls/tagList';

export default {
  directives: {
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
      this.$refs.dropdown.hide();
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

      const tagCount = filteredItems.length;

      const result = filteredItems.slice(0, 5);

      if (tagCount > 5) {
        result.push({
          id: 'none',
          name: this.$t('moreTags', { amount: tagCount - 5 }),
        });
      }

      return result;
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
