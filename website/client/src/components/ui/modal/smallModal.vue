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
    :static="disableLazyRender"
  >
    <slot></slot>

    <footer class="greyed" v-if="isGreyedSlotPresent && !hideFooter">
      <slot name="greyed"></slot>
    </footer>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  .modal-dialog.modal-sm {
    .modal-content {
      border-radius: 8px;
      box-shadow: 0 14px 28px 0 rgba($black, 0.24), 0 10px 10px 0 rgba($black, 0.28);
    }

    @media (min-width: 576px) {
      max-width: 20.625rem;
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

    .modal-text {
      margin: 1.5rem;
      min-height: auto !important;
    }

    footer.greyed {
      padding: 0 1.5rem 1rem 1.5rem
    }
  }
</style>


<script>
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
    hideFooter: Boolean,
  },
  data () {
    return { disableLazyRender: false };
  },
  computed: {
    isGreyedSlotPresent () {
      return Boolean(this.$slots.greyed);
    },
  },
};
</script>
