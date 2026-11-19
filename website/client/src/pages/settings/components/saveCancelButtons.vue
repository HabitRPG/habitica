<template>
  <div
    class="buttons"
    :class="{'no-padding': noPadding}"
  >
    <button
      v-if="!hideSave"
      class="btn btn-save mb-2"
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

<style lang="scss" scoped>

.buttons {
  align-items: center;
  display: flex;
  flex-direction: column;

  &:not(.no-padding) {
    margin-top: 1.5rem;
  }
}
</style>

<script>
export default {
  name: 'SaveCancelButtons',
  props: {
    hideSave: {
      type: Boolean,
      default: false,
    },
    hideCancel: {
      type: Boolean,
      default: false,
    },
    disableSave: {
      type: Boolean,
      default: false,
    },
    noPadding: {
      type: Boolean,
      default: false,
    },
    primaryButtonLabel: {
      type: String,
      default: 'save',
    },
    primaryButtonColor: {
      type: String,
      default: 'btn-primary',
    },
  },
};
</script>
