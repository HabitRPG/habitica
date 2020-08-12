<template>
  <div class="form-check">
    <div class="custom-control custom-checkbox">
      <input
        :id="id"
        v-model="isChecked"
        class="custom-control-input"
        type="checkbox"
        :disabled="disabled"
      >
      <label
        class="custom-control-label"
        :class="{disabled: disabled}"
        :for="id"
        :disabled="disabled"
      >{{ text }}</label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .custom-control.custom-checkbox {
    margin-bottom: 0 !important;
  }

  label:not(:disabled):not(.disabled) {
    cursor: pointer;
  }

  .custom-control.custom-checkbox {
    display: flex;
    flex-direction: row;

    justify-items: center;
  }
</style>

<script>
export default {
  props: {
    checked: Boolean,
    disabled: Boolean,
    id: String,
    text: String,
  },
  data () {
    return {
      isChecked: this.checked,
    };
  },
  watch: {
    checked (after) {
      this.isChecked = after;
    },
    isChecked (after) {
      this.$emit('update:checked', after);
    },
  },
};
</script>
