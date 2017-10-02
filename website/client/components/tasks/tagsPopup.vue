<template lang="pug">
.tags-popup
  .tags-category.d-flex
    .tags-header
      strong(v-once) {{ $t('tags') }}
    .tags-list.container
      .row
        template
          .col-6(v-for="tag in tags")
            label.custom-control.custom-checkbox
              input.custom-control-input(type="checkbox", :value="tag.id", v-model="selectedTags")
              span.custom-control-indicator
              span.custom-control-description(v-markdown='tag.name')
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .tags-popup {
    padding-left: 24px;
    padding-right: 24px;
    max-width: 593px;
    z-index: 9999;
    background: $white;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba($black, 0.16), 0 1px 4px 0 rgba($black, 0.12);
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

    .tags-list {
      .custom-control-description {
        color: $gray-50 !important;
        font-weight: normal;
      }
    }
  }
</style>

<script>
import markdown from 'client/directives/markdown';
import Vue from 'vue';

export default {
  directives: {
    markdown,
  },
  props: ['tags', 'value'],
  data () {
    return {
      selectedTags: []
    }
  },
  watch: {
    selectedTags () {
      this.$emit('input', this.selectedTags);
    }
  },
  mounted () {
    this.selectedTags = this.value;
  }
};
</script>
