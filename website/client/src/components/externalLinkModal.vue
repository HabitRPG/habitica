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
      <h2>You are about to leave Habitica.com</h2>
    </div>
    <div class="row">
      Habitica is not responsible for the content of any linked
      website that is not owned or operated by HabitRPG.
      Please note that these websites' practices may differ
      from Habitica’s community guidelines.
    </div>
    <div slot="modal-footer">
      <button
        v-once
        class="btn btn-primary"
        @click="submit()"
      >
        {{ $t('onwards') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
@import '~@/assets/scss/colors.scss';
#external-link-modal {
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

    h2 {
      color: $green-1;
    }

    .exclamation-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: $yellow-1;
      margin: 0 auto;
      margin-bottom: 16px;
    }

    .svg-exclamation {
      width: 45px;
      color: $white;
    }
  }

  .modal-body {
    padding: 16px 32px 24px 32px;
    background: $white;

    .modal-body-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .btn.btn-primary {
        margin-top: 24px;
      }
    }

    .details-block {
      background: $gray-700;
      border-radius: 4px;
      padding: 8px 16px;
      margin-top: 16px;
      display: inline-flex;
      flex-direction: row;
      text-align: center;
      }
    }
  }
}
</style>

<script>
import exclamationIcon from '@assets/svg/exclamation.svg';
import closeIcon from '@/assets/svg/close.svg';

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
    }
  },
};
</script>
