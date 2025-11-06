<template>
  <b-modal
    id="purchase-confirm-modal"
    size="md"
    :hide-footer="true"
  >
    <div class="text-center">
      <h2 class="col-12">
        {{ confirmationMessage }}
      </h2>
    </div>
    <div class="modal-footer d-flex justify-content-between">
      <button
        class="btn btn-primary"
        @click="confirm()"
      >
        {{ $t('confirm') }}
      </button>
      <button
        class="btn btn-secondary"
        @click="cancel()"
      >
        {{ $t('cancel') }}
      </button>
    </div>
  </b-modal>
</template>

<script>
export default {
  data () {
    return {
      confirmationMessage: '',
      resolveCallback: null,
    };
  },
  mounted () {
    this.$root.$on('habitica:purchase-confirm', config => {
      this.confirmationMessage = config.message;
      this.resolveCallback = config.resolve;
      this.$root.$emit('bv::show::modal', 'purchase-confirm-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:purchase-confirm');
  },
  methods: {
    confirm () {
      if (this.resolveCallback) {
        this.resolveCallback(true);
      }
      this.close();
    },
    cancel () {
      if (this.resolveCallback) {
        this.resolveCallback(false);
      }
      this.close();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'purchase-confirm-modal');
    },
  },
};
</script>
