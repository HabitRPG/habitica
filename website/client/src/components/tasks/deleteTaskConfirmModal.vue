<template>
  <b-modal
    id="delete-task-confirm-modal"
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
        class="btn btn-danger"
        @click="confirm()"
      >
        {{ $t('delete') }}
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
    this.$root.$on('habitica:delete-task-confirm', config => {
      this.confirmationMessage = config.message;
      this.resolveCallback = config.resolve;
      this.$root.$emit('bv::show::modal', 'delete-task-confirm-modal');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:delete-task-confirm');
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
      this.$root.$emit('bv::hide::modal', 'delete-task-confirm-modal');
    },
  },
};
</script>
