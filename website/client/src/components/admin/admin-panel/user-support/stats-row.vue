<template>
  <div class="form-group row">
    <label
      class="col-sm-3 col-form-label"
      :class="color"
    >{{ label }}</label>
    <div class="col-sm-9">
      <input
        :value="value"
        class="form-control"
        type="number"
        :step="step"
        :max="max"
        :min="min"
        @input="$emit('input', parseInt($event.target.value, 10))"
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

  .about-row {
    margin-left: 0px;
    margin-right: 0px;
  }

  .red-label {
    color: $red_100;
  }
  .blue-label {
    color: $blue_100;
  }
  .purple-label {
    color: $purple_300;
  }
  .yellow-label {
    color: $yellow_50;
  }
</style>

<script>
export default {
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: 'text-label',
    },
    value: {
      type: Number,
      required: true,
    },
    step: {
      type: String,
      default: 'any',
    },
    min: {
    },
    max: {
    },
  },
};
</script>
