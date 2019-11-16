<template>
  <div class="form-check">
    <div class="custom-control custom-checkbox">
      <input
        :id="id"
        v-model="isChecked"
        class="custom-control-input"
        type="checkbox"
      >
      <label
        v-once
        class="custom-control-label"
        :for="id"
      >{{ text }}</label>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    checked: Boolean,
    id: String,
    text: String,
  },
  data () {
    return {
      isChecked: this.checked,
    };
  },
  watch: {
    isChecked (after) {
      this.$emit('update:checked', after);
    },
  },
};
</script>
