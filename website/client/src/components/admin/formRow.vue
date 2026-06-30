<template>
  <div class="form-group row">
    <label class="col-sm-3 col-form-label"><slot name="label">{{ label }}</slot></label>
    <div class="col-sm-9">
      <slot>
        <textarea
          v-if="inputType === 'textarea'"
          :value="value"
          class="form-control"
          :rows="rows"
          @input="$emit('input', $event.target.value)"
        ></textarea>
        <input
          v-else
          :value="value"
          class="form-control"
          :type="inputType"
          @input="$emit('input', $event.target.value)"
        >
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    label: {
      type: String,
    },
    value: {
      type: [String, Boolean],
    },
    inputType: {
      type: String,
      default: 'text',
    },
    rows: {
      default: 3,
    },
  },
};
</script>
