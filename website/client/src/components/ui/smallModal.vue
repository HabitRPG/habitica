<template>
  <b-modal
    :id="id"
    size="sm"
    :title="title"
    ok-only
    :ok-title="$t(buttonTextKey)"
    :footer-class="{ greyed: isGreyedSlotPresent}"
  >
    <section class="d-flex">
      <span
        class="star-group mirror"
        v-html="icons.starGroup"
      ></span>
      <slot name="starred"></slot>
      <span
        class="star-group"
        v-html="icons.starGroup"
      ></span>
    </section>

    <p
      v-once
      class="text"
    >
      <slot></slot>
    </p>

    <section class="greyed" v-if="isGreyedSlotPresent">
      <div
        v-if="hasRewards"
        class="your-rewards d-flex"
      >
        <span
          class="sparkles"
          v-html="icons.sparkles"
        ></span>
        <span class="text">{{ $t('yourRewards') }}</span>
        <span
          class="sparkles mirror"
          v-html="icons.sparkles"
        ></span>
      </div>

      <slot name="greyed"></slot>
    </section>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .modal-dialog {
    .modal-content {
      border-radius: 8px;
      box-shadow: 0 14px 28px 0 rgba($black, 0.24), 0 10px 10px 0 rgba($black, 0.28);
    }

    @media (min-width: 576px) {
      .modal-sm {
        max-width: 330px;
      }
    }

    header {
      padding: 0;
      border: none;

      h5 {
        margin: 31px auto 16px;
        color: $purple-200;
      }

      button {
        position: absolute;
        right: 18px;
        top: 12px;
      }
    }

    footer {
      padding: 0;
      border: none;

      button {
        margin: 0 auto 32px auto;
      }
    }

    .greyed {
      background-color: $gray-700;
    }

    .modal-body {
      padding: 0;
    }

    .mirror {
      transform: scaleX(-1);
    }

    .star-group {
      margin: auto;

      svg {
        height: 64px;
        width: 40px;
      }
    }

    .text {
      margin: 25px 24px 24px;
      min-height: auto !important;
    }

    .your-rewards {
      margin: 0 auto;
      width: fit-content;

      .sparkles {
        width: 32px;
        margin-top: 12px;
      }

      .text {
        font-weight: bold;
        margin: 16px;
        color: $gray-50;
      }
    }

    section.greyed {
      padding-bottom: 17px
    }
  }
</style>


<script>
import starGroup from '@/assets/svg/star-group.svg';
import sparkles from '@/assets/svg/sparkles-left.svg';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    buttonTextKey: {
      type: String,
      default: 'onwards',
    },
    hasRewards: Boolean,
  },
  data () {
    return {
      icons: Object.freeze({
        starGroup,
        sparkles,
      }),
    };
  },
  computed: {
    isGreyedSlotPresent () {
      return Boolean(this.$slots.greyed);
    },
  },
};
</script>
