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
      <span class="mr-1">
        <strong>You're previewing new Habitica Groups!</strong>
      </span>
      <a href="mailto:admin@habitica.com" class="send-feedback">
        Have a question?
      </a>
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
