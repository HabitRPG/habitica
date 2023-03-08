<template>
  <b-modal
    id="external-link-modal"
    size="md"
  >
    <!-- HEADER -->
    <div slot="modal-header">
      <div
        class="modal-close"
        @click="close()"
      >
        <div
          class="icon-close"
          v-html="icons.close"
        >
        </div>
      </div>
      <div class="exclamation-container d-flex align-items-center justify-content-center">
        <div
          v-once
          class="svg-icon svg-exclamation"
          v-html="icons.exclamation"
        ></div>
      </div>
      <h2>
        {{ $t('leaveHabitica') }}
      </h2>
    </div>

    <!-- BODY -->
    <div
      class="row leave-warning-text"
      v-html="$t('leaveHabiticaText')"
    >
    </div>

    <!-- FOOTER -->
    <div slot="modal-footer">
      <button
        v-once
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('continue') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

#external-link-modal {
  .modal-md {
    max-width: 448px;
    min-width: 330px;

  .modal-close {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;

    .icon-close {
      width: 18px;
      height: 18px;
      vertical-align: middle;

      & svg {
        fill: $yellow-1;
      }
       & :hover {
        fill: $yellow-1;
      }
    }
  }

  .modal-content {
    background: transparent;
  }

  .modal-header {
    justify-content: center;
    padding-top: 24px;
    padding-bottom: 0px;
    background: $yellow-100;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    border-bottom: none;

    .exclamation-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: $yellow-1;
      margin: 0 auto;
      margin-bottom: 16px;
    }

    .svg-exclamation {
      width: 8px;
      color: $white;
    }

    h2 {
      color: $yellow-1;
      // font-size: 1.25rem;
    }
  }

  .modal-body {
    padding: 16px 44px 20px 44px;
    background: $white;

    .leave-warning-text {
      font-size: 0.875rem;
      line-height: 1.71;
      text-align: center;
    }
  }

    .modal-footer {
      background: $white;
      border-bottom-right-radius: 8px;
      border-bottom-left-radius: 8px;
      justify-content: center;
      border-top: none;
      padding-top: 0;
    }
  }
}
</style>

<script>
import exclamationIcon from '@/assets/svg/exclamation.svg';
import closeIcon from '@/assets/svg/new-close.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
        exclamation: exclamationIcon,
      }),
    };
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'external-link-modal');
      console.log('Bye!');
    },
  },
};
</script>
