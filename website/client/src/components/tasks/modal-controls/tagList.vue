<template>
  <div class="tag-list">
    <template v-if="tags.length === 0">
      <div class="tags-none">{{ $t('none') }}</div>
    </template>
    <template v-else>
      <div
        :key="tagName"
        :title="tagName"
        class="tag m-r-xs"
        v-for="tagName in truncatedSelectedTags"

      >
        <span class="tag-label m-l-m m-t-xs m-b-xs m-r-s" v-markdown="tagName"></span>
        <span class="remove m-r-l"
              v-html="icons.remove"></span>
      </div>
      <div
        class="tags-more m-l-m"
        v-if="remainingSelectedTags.length > 0"
      >
        +{{ $t('more', { count: remainingSelectedTags.length }) }}
      </div>
    </template>
  </div>
</template>


<style lang="scss">
  .tag-list {
    p {
      display: inline;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .tag-list {
    width: 100%;
  }

  .tag {
    display: inline-block;
    height: 1.5rem;
    border-radius: 100px;
    background-color: $gray-600;

    .tag-label {
      height: 1rem;

      font-size: 12px;
      line-height: 1.33;
      letter-spacing: normal;
      color: $gray-100;
    }

    .remove {
      display: inline-block;
      width: 0.313rem;
      height: 0.313rem;
      object-fit: contain;
    }
  }

  .tags-more {
    color: $gray-300;
    font-size: 12px;
    display: inline-block;
  }
</style>

<script>
import removeIcon from '@/assets/svg/close.svg';
import markdownDirective from '@/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  components: {},
  data () {
    return {
      icons: Object.freeze({
        remove: removeIcon,
      }),
    };
  },
  computed: {
    truncatedSelectedTags () {
      if (this.maxTags <= 0) {
        return this.tags;
      }

      return this.tags.slice(0, this.maxTags);
    },
    remainingSelectedTags () {
      if (this.maxTags <= 0) {
        return [];
      }

      return this.tags.slice(this.maxTags);
    },
  },
  props: {
    tags: {
      type: Array,
    },
    maxTags: {
      type: Number,
      default: 3,
    },
  },
};
</script>
