<template>
  <div
    class="multi-list"
    :class="{ 'break': maxItems === 0 }"
  >
    <template v-if="items.length === 0">
      <div class="items-none mb-1">
        {{ emptyMessage }}
      </div>
    </template>
    <template v-else>
      <div
        v-for="item in items"
        :key="item.id"
        :title="item.name"
        class="multi-item mr-1 mb-1 d-inline-flex align-items-center"
        :class="{'margin-adjust': maxItems !== 0, 'pill-invert': pillInvert}"

        @click.stop="removeItem($event, item)"
      >
        <div
          v-markdown="item.name"
          class="multi-label my-auto ml-75 mr-2"
        ></div>
        <div
          class="remove ml-auto mr-75"
          v-html="icons.remove"
        ></div>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .multi-list {
    p {
      display: inline;
      margin: 0 !important;
      padding: 0 !important;
    }

    .multi-item {
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

  .margin-adjust {
    margin-top: -1px;
  }

  .multi-list {
    width: 100%;

    &.break {
      display: flex;
      flex-wrap: wrap;

      .multi-item {
        margin-bottom: 0.375rem;
      }
    }
  }

  .multi-item {
    display: inline-block;
    height: 1.5rem;
    border-radius: 100px;
    background-color: $gray-600;

    cursor: pointer;

    &.pill-invert {
      background-color: $white;
      border: solid 1px $gray-400;
    }

    .multi-label {
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

  .items-more {
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
  props: {
    addNew: {
      type: Boolean,
      default: false,
    },
    emptyMessage: {
      type: String,
    },
    maxItems: {
      type: Number,
      default: 3,
    },
    pillInvert: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        remove: removeIcon,
      }),
    };
  },
  computed: {
    truncatedSelectedItems () {
      if (this.maxItems <= 0) {
        return this.items;
      }

      return this.items.slice(0, this.maxItems);
    },
    remainingSelectedItems () {
      if (this.maxItems <= 0) {
        return [];
      }

      return this.items.slice(this.maxItems);
    },
  },
  methods: {
    removeItem ($event, item) {
      this.$emit('remove-item', item.id);
    },
  },
};
</script>
