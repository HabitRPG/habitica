<template>
  <div class="buttons">
    <button
      class="btn btn-save"
      :class="primaryButtonColor ?? 'btn-primary'"
      type="submit"
      :disabled="disableSave"
      @click="$emit('saveClicked')"
    >
      {{ $t(primaryButtonLabel ?? 'save') }}
    </button>

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
  props: ['disableSave', 'primaryButtonLabel', 'primaryButtonColor'],
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
