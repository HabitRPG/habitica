<template>
  <div
    class="tag-list"
    :class="{ 'break': maxTags === 0 }"
  >
    <template v-if="tags.length === 0">
      <div class="tags-none">{{ $t('addTags') }}</div>
    </template>
    <template v-else>
      <div
        :key="tag.id"
        :title="tag.name"
        class="tag mr-1 mt-n1 d-inline-flex align-items-center"
        v-for="tag in truncatedSelectedTags"

        @click.stop="removeTag($event, tag)"
      >
        <div
          class="tag-label my-auto mx-2"
          v-markdown="tag.name"
        ></div>
        <div
          class="remove mt-n1 ml-auto mr-2"
          v-html="icons.remove"
        ></div>
      </div>
      <div
        class="tags-more ml-75"
        v-if="remainingSelectedTags.length > 0"
      >
        +{{ $t('more', { count: remainingSelectedTags.length }) }}
      </div>
    </template>
  </div>
</template>


<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .tag-list {
    p {
      display: inline;
      margin: 0 !important;
      padding: 0 !important;
    }


    .tag {
      &:hover {
        .remove svg path {
          stroke: $maroon-50;
        }
      }

      .remove svg path {
        stroke: $gray-200;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .tag-list {
    width: 100%;

    &.break {
      display: flex;
      flex-wrap: wrap;

      .tag {
        margin-bottom: 0.25rem;
      }
    }
  }

  .tag {
    display: inline-block;
    height: 1.5rem;
    border-radius: 100px;
    background-color: $gray-600;

    cursor: pointer;

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
  methods: {
    removeTag ($event, tag) {
      this.$emit('remove-tag', tag.id);
    },
  },
};
</script>
