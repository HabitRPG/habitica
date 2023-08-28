<template>
  <base-banner
    banner-id="chat-warning"
    banner-class="chat-banner"
    class="chat-banner"
    height="3rem"
    v-if="showChatWarning"
    :class="{faq: faqPage}"
  >
    <div
      slot="content"
      class="w-100 text-center"
      v-html="$t('chatSunsetWarning')"
    >
    </div>
  </base-banner>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .chat-banner {
    width: 100%;
    min-height: 48px;
    padding: 8px;
    color: $orange-1;
    background-color: $orange-100;
    line-height: 1.71;

    a {
      color: $orange-1;
      text-decoration: underline;

      &:hover {
        color: $orange-1;
      }
    }

    &.faq {
      position: fixed;
      top: 3.5rem;
    }
  }

</style>

<script>
import BaseBanner from './base';

export default {
  components: {
    BaseBanner,
  },
  computed: {
    faqPage () {
      return (this.$route.fullPath.indexOf('/faq')) !== -1;
    },
    showChatWarning () {
      return false;
    },
  },
};

</script>
