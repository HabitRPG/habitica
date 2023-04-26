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
    <div
      class="skip-modal"
    >
      {{ $t('skipExternalLinkModal') }}
    </div>

    <!-- FOOTER -->
    <div slot="modal-footer">
      <button
        v-once
        class="btn btn-primary"
        @click="proceed()"
      >
        {{ $t('continue') }}
      </button>
      <div
        v-once
        class="close-link justify-content-center"
        @click="close()"
      >
        {{ $t('cancel') }}
      </div>
    </div>
  </b-modal>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';

#external-link-modal {
  &.modal {
    display: flex !important;
  }

  .modal-md {
    max-width: 448px;
    min-width: 330px;
    margin: auto;

  .modal-close {
    position: absolute;
    right: 12px;
    top: 12px;
    cursor: pointer;

    .icon-close {
      width: 16px;
      height: 16px;
      vertical-align: middle;

      & svg {
        fill: $yellow-1;
        opacity: 0.75;
      }
       & :hover {
        fill: $yellow-1;
        opacity: 1;
      }
    }
  }

  .modal-content {
    background: transparent;
  }

  .modal-header {
    justify-content: center;
    padding-top: 32px;
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
      margin-bottom: 16px;
    }
  }

  .modal-body {
    padding: 16px 44px 20px 44px;
    background: $white;

    .leave-warning-text {
      font-size: 0.875rem;
      line-height: 1.71;
      text-align: center;
      margin-top:24px;
    }

    .skip-modal {
      color: $gray-100;
      font-size: 0.75rem;
      text-align: center;
      line-height: 1.33;
      margin-top: 16px;
      // padding-bottom: 24px;
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
    .close-link {
      color: $purple-300;
      line-height: 1.71;
      font-size: 0.875rem;
      cursor: pointer;
      margin-top:16px;
      margin-bottom: 8px;
      text-align: center;

      &:hover {
        text-decoration: underline;
      }
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
      url: '',
    };
  },
  mounted () {
    this.$root.$on('habitica:external-link', url => {
      this.url = url;
      this.$root.$emit('bv::show::modal', 'external-link-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:external-link');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'external-link-modal');
    },
    proceed () {
      window.open(this.url, '_blank').focus();
      this.close();
    },
  },
};
</script>
