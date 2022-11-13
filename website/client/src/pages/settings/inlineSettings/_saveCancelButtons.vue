<template>
  <div class="buttons">
    <button
      class="btn btn-primary btn-save"
      type="submit"
      :disabled="disableSave"
      @click="$emit('saveClicked')"
    >
      {{ $t('save') }}
    </button>
    <br>

    <a
      class="edit-link"
      @click.prevent="$emit('cancelClicked')"
    >
      {{ $t('cancel') }}
    </a>
  </div>
</template>

<script>
export default {
  name: 'SaveCancelButtons',
  props: ['disableSave'],
};
</script>

<style scoped>

.buttons {
  align-items: center;
  display: flex;
  flex-direction: column;
}


.btn-save {
  margin-bottom: 1rem;
}
</style>
