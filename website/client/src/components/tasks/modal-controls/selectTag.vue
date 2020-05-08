<template>
  <div class="select-tag">
    <div
      class="dropdown inline-dropdown"
      :class="{ show: showTagsSelect }"
      @click="toggleTagSelect()"
    >
      <span class="btn dropdown-toggle btn-secondary">
        <tag-list :tags="currentlySelectedTags" />
      </span>
    </div>

    <tags-popup
      v-if="showTagsSelect"
      ref="popup"
      v-model="selected"
      :tags="allTags"
      @close="closeTagsPopup()"
    />
  </div>
</template>


<style lang="scss">
  .select-tag {
    position: relative;
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

</style>

<script>
import TagsPopup from './tagsPopup';
import TagList from './tagList';
import { mapGetters } from '@/libs/store';

export default {
  directives: {
  },
  components: {
    TagList,
    TagsPopup,
  },
  data () {
    return {
      showTagsSelect: false,
      selected: this.selectedTags,
    };
  },
  methods: {
    toggleTagSelect () {
      this.showTagsSelect = !this.showTagsSelect;
    },
    closeTagsPopup () {
      this.showTagsSelect = false;
    },
    closeIfOpen (element) {
      if (this.$refs.popup && (!element || !this.$refs.popup.$el.parentNode.contains(element))) {
        this.closeTagsPopup();
      }
    },
  },
  computed: {
    ...mapGetters({
      getTagsByIdList: 'tasks:getTagsByIdList',
    }),
    currentlySelectedTags () {
      return this.getTagsByIdList(this.selected);
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
};
</script>
