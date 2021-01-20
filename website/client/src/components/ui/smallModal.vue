<template>
  <b-modal
    :id="id"
    size="sm"
    :title="title"
    ok-only
    :ok-title="$t(buttonTextKey)"
    @ok="$emit('buttonClicked')"
    :footer-class="{ greyed: isGreyedSlotPresent}"
    :hide-footer="hideFooter"
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

    <p class="text">
      <slot></slot>
    </p>

    <section class="greyed" v-if="isGreyedSlotPresent">
      <div
        v-if="hasRewards"
        class="your-rewards d-flex"
      >
        <span
          v-once
          class="sparkles"
          v-html="icons.sparkles"
        ></span>
        <span v-once class="text">{{ $t('yourRewards') }}</span>
        <span
          v-once
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
        width: 20.625rem;
        max-width: 20.625rem;
      }
    }

    header {
      padding: 0;
      border: none;

      h5 {
        margin: 2rem auto 1rem;
        color: $purple-200;
      }

      button {
        position: absolute;
        right: 18px;
        top: 12px;
        font-weight: 100;
      }
    }

    footer {
      padding: 0;
      border: none;

      button {
        margin: 0 auto 2rem auto;
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
        height: 4rem;
        width: 2.5rem;
      }
    }

    .text {
      margin: 1.5rem;
      min-height: auto !important;
    }

    .your-rewards {
      margin: 0 auto;
      width: fit-content;

      .sparkles {
        width: 2rem;
        margin-top: .75rem;
      }

      .text {
        font-weight: bold;
        margin: 1rem;
        color: $gray-50;
      }
    }

    section.greyed {
      padding: 0 1.5rem 1rem 1.5rem
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
    hideFooter: Boolean,
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
