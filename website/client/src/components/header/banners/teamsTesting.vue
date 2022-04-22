<template>
  <base-banner
    banner-id="teams-testing"
    banner-class="testing-banner"
    height="48px"
    :canClose="false"
  >
    <div
      slot="content"
      class="content m-auto d-flex justify-content-center align-items-center"
    >
      <img src="~@/assets/images/bug.png" class="mr-11px">
      <span class="mr-1">
        <strong>You're using the Habitica Groups Beta.</strong>
      </span>
      <a href="mailto:testing@habitica.com" class="send-feedback">
        Please submit bugs and feedback here.
      </a>
      <img src="~@/assets/images/bug.png" class="ml-11px flip">
    </div>
  </base-banner>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

.testing-banner {
  background-color: $black;
  background-image: url('~@/assets/images/group-plans/purple-diagonal.png');

  .content {
    line-height: 1.71;
    color: $white;
  }

  @media only screen and (max-width: 992px) {
    .content {
      font-size: 12px;
      line-height: 1.4;
    }
  }

  .flip {
    transform: scaleX(-1);
  }

  .ml-11px {
    margin-left: 11px;
  }

  .mr-11px {
    margin-right: 11px;
  }

  .send-feedback {
    color: $white;
    text-decoration: underline;
  }
}
</style>

<script>
import BaseBanner from './base';

export default {
  components: {
    BaseBanner,
  },
};
</script>
