<template lang="pug">
  .form-check
    .custom-control.custom-checkbox
      input.custom-control-input(type="checkbox", v-model="isChecked", :id="id")
      label.custom-control-label(v-once, :for="id") {{ text }}
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
