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
        v-once
        class="custom-control-label"
        :for="id"
      >{{ text }}</label>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .custom-control.custom-checkbox {
    margin-bottom: 0 !important;
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
