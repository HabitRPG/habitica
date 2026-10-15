<template>
  <div>
    <textarea
      v-if="type == 'text'"
      type="text"
      :value="value"
      class="form-control"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :class="{ 'is-invalid input-invalid': !isValid }"
      rows="1"
      @input="validateValue($event.target.value)"
    ></textarea>
    <input
      v-if="type == 'number'"
      type="number"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="validateValue($event.target.value)"
    >
    <input
      v-if="type == 'boolean'"
      type="checkbox"
      :checked="value"
      class="align-middle"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="validateValue($event.target.checked)"
    >
    <textarea
      v-if="type == 'json'"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      rows="8"
      @input="validateValue($event.target.value)"
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'ConfigValueField',
  props: {
    type: {
      type: String,
      default: 'text',
    },
    value: {
      type: [String, Number, Boolean],
    },
  },
  data () {
    return {
      isValid: false,
    };
  },
  mounted () {
    this.validateValue(this.value);
  },
  methods: {
    validateValue (value) {
      if (this.type === 'number') {
        this.validateValueAsNumber(value);
      } else if (this.type === 'text') {
        this.validateValueAsText(value);
      } else if (this.type === 'boolean') {
        this.validateValueAsBoolean(value);
      } else if (this.type === 'json') {
        this.validateValueAsJson(value);
      }
      this.$emit('input', value);
    },
    validateValueAsNumber (value) {
      this.isValid = !isNaN(value);
    },
    validateValueAsText (value) {
      this.isValid = value.length > 0;
    },
    validateValueAsBoolean (value) {
      this.isValid = typeof value === 'boolean';
    },
    validateValueAsJson (value) {
      try {
        JSON.parse(value);
        this.isValid = true;
      } catch (e) {
        this.isValid = false;
      }
    },
  },
};
</script>
