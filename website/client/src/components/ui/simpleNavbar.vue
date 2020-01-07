<template>
  <div class="nav">
    <template v-if="routerLinks">
      <router-link
        v-for="item in items"
        :key="item.name"
        class="nav-item"
        :to="{name: item.name}"
        :params="item.params"
        :exact="item.exact"
      >
        {{ $t(item.title) }}
      </router-link>
    </template>

    <template v-else>
      <div
        v-for="(item, index) in items"
        :key="item"
        class="nav-item"
        :class="{active: item === active}"
        @click="$emit('change', item, index)"
      >
        {{ noTranslate ? item : $t(item) }}
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .nav-item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1em 1.5em;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    user-select: none;

    &:hover:not(.active) {
      color: $purple-200;
    }

    &.active {
      color: $purple-200;
      box-shadow: 0px -4px 0px $purple-300 inset;
      cursor: default;
    }
  }

  .nav {
    display: flex;
    font-weight: bold;
    justify-content: center;
    line-height: 1.5;

    &.gray,
    &.secondary-menu {
      background-color: $gray-600;
    }

    &.large,
    &.secondary-menu {
      font-size: 16px;
    }

    &.small {
      font-size: 12px;
      line-height: 1.33;

      .nav-item {
        padding: 8px;

        &.active {
          box-shadow: 0px -2px 0px $purple-300 inset;
        }
      }
    }

    &.drawer {
      font-size: 12px;
      line-height: 1.67;

      .nav-item {
        padding: 0 8px 10px;

        &.active,
        &:hover {
          color: currentColor;
        }

        &.active {
          box-shadow: 0px -2px 0px $purple-400 inset;
        }
      }
    }

    &.secondary-menu {
      box-shadow: 0 1px 2px 0 rgba($black, 0.2);
      z-index: 9;

      & .nav-item:not(:hover),
      & .nav-item:not(.active) {
        color: $gray-50;
      }

      & .nav-item:hover:not(.active) {
        background: $gray-500;
      }
    }

    &.split-words .nav-item {
      flex-basis: 0;
    }
  }
</style>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },

    active: {
      type: String,
    },

    routerLinks: {
      type: Boolean,
      default: false,
    },

    noTranslate: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
