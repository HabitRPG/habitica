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
        class="tag mr-1 d-inline-flex align-items-center"
        :class="{'mt-n1': maxTags !== 0}"
        v-for="tag in truncatedSelectedTags"

        @click.stop="removeTag($event, tag)"
      >
        <div
          class="tag-label my-auto ml-75 mr-2"
          v-markdown="tag.name"
        ></div>
        <div
          class="remove ml-auto mr-75"
          v-html="icons.remove"
        ></div>
      </div>
      <div
        class="tags-more ml-75"
        v-if="remainingSelectedTags.length > 0"
      >
        +{{remainingSelectedTags.length}}
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

      .remove {
        svg {
          width: 0.5rem;
          height: 0.5rem;

          path {
            stroke: $gray-200;
          }
        }
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
        margin-bottom: 0.375rem;
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
      line-height: 16px;
      letter-spacing: normal;
      color: $gray-100;
    }

    .remove {
      display: inline-block;
      object-fit: contain;
      margin-top: -0.125rem;
    }
  }

  .tags-more {
    color: $gray-100;
    font-size: 12px;
    display: inline-block;
    height: 1rem;
    font-weight: bold;
    line-height: 1.33;
    letter-spacing: normal;
  }
</style>

<script>
import removeIcon from '@/assets/svg/remove.svg';
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
