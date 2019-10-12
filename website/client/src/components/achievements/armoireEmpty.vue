<template>
  <b-modal
    id="armoire-empty"
    :title="$t('armoireText')"
    size="lg"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="row">
        <div class="col-6 offset-3">
          <div class="shop_armoire"></div>
          <p>{{ $t('armoireLastItem') }}</p>
          <p>{{ $t('armoireNotesEmpty') }}</p>
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
  .shop_armoire {
    margin: 1em auto;
  }
</style>

<script>
export default {
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'armoire-empty');
    },
  },
};
</script>
