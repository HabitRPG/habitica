<template>
  <b-modal
    id="group-gems-modal"
    :title="$t('groupGems')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="row">
        <div class="col-6 offset-3">
          <h3>{{ $t('groupGemsDesc') }}</h3>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="col-12 text-center">
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('close') }}
        </button>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
  .modal-body {
    margin-top: 1em;
    margin-bottom: 1em;
  }
</style>

<script>
export default {
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'group-gems-modal');
    },
  },
};
</script>
