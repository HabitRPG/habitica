<template>
  <div
    class="buttons"
    :class="{'no-padding': noPadding}"
  >
    <button
      v-if="!hideSave"
      class="btn btn-save"
      :class="primaryButtonColor ?? 'btn-primary'"
      type="submit"
      :disabled="disableSave"
      @click="$emit('saveClicked')"
    >
      {{ $t(primaryButtonLabel ?? 'save') }}
    </button>

    <a
      v-if="!hideCancel"
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
  props: {
    hideSave: {
      type: Boolean,
    },
    hideCancel: {
      type: Boolean,
    },
    disableSave: {
      type: Boolean,
    },
    noPadding: {
      type: Boolean,
    },
    primaryButtonLabel: {
      type: String,
    },
    primaryButtonColor: {
      type: String,
    },
  },
};
</script>

<style lang="scss" scoped>

.buttons {
  align-items: center;
  display: flex;
  flex-direction: column;

  &:not(.no-padding) {
    margin-top: 1.5rem;
  }
}

.btn-save {
  margin-bottom: 1rem;
}
</style>
