<template>
  <div class="bottom-banner">
    <div class="d-flex justify-content-center align-items-center mt-3">
      <span
        class="svg svg-icon sparkles"
        v-html="icons.sparkles"
      ></span>
      <strong
        v-once
        class="mx-2"
      > {{ $t('lookingForMore') }}
      </strong>
      <span
        v-once
        class="svg svg-icon sparkles mirror"
        v-html="icons.sparkles"
      ></span>
    </div>
    <div
      class="check-link"
    >
      <span v-html="$t('visitCustomizationsShopEvenMore', shopLinks)"></span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

  .bottom-banner {
    background: linear-gradient(114.26deg, $purple-300 0%, $purple-200 100%);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    color: $white;
    height: 80px;
    line-height: 24px;

    .check-link, ::v-deep a {
      color: $purple-600;
    }

    ::v-deep a {
      text-decoration: underline;
    }
  }
  .sparkles {
    width: 32px;

    &.mirror {
      transform: scaleX(-1);
    }
  }
</style>

<script>
import sparkles from '@/assets/svg/sparkles-left.svg?raw';

export default {
  data () {
    return {
      icons: Object.freeze({
        sparkles,
      }),
      shopLinks: {
        linkOpen: '<a href="/shops/customizations">',
        linkClose: '</a>',
      },
    };
  },
};
</script>
