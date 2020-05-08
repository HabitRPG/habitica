<template>
  <div class="select-tag">
    <div
      class="dropdown inline-dropdown"
      :class="{ active: showTagsSelect }"
      @click="toggleTagSelect()"
    >
      <span class="btn dropdown-toggle btn-secondary">
        <tag-list :tags="selectedTags" />
      </span>
    </div>

    <tags-popup
      v-if="showTagsSelect"
      ref="popup"
      v-model="selectedTags"
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

    },
    props: {
      selectedTags: {
        type: Array,
      },
      allTags: {
        type: Array,
      }
    },
  };
</script>
