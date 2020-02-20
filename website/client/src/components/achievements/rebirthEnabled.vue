<template>
  <b-modal
    id="rebirth-enabled"
    :title="$t('rebirthNew')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body">
      <div class="col-12">
        <div class="rebirth_orb"></div>
        <p>
          <span>{{ $t('rebirthUnlock') }}</span>
        </p>
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
  .rebirth_orb {
    margin: 0 auto;
  }
</style>

<script>
import { mapState } from '@/libs/store';

export default {
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'rebirth-enabled');
    },
  },
};
</script>
