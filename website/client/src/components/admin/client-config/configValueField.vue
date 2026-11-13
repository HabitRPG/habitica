<template>
  <div>
    <input
      v-if="type == 'number'"
      type="number"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="validateValue($event.target.value)"
    >
    <input
      v-else-if="type == 'boolean'"
      type="checkbox"
      :checked="value"
      class="align-middle"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="validateValue($event.target.checked)"
    >
    <textarea
      v-else-if="type == 'json'"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      rows="8"
      @input="validateValue($event.target.value)"
    ></textarea>
    <input
      v-else-if="type == 'email'"
      type="email"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="validateValue($event.target.value)"
    >
    <input
      v-else-if="type == 'url'"
      type="url"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="validateValue($event.target.value)"
    >
    <input
      v-else-if="type == 'date'"
      type="date"
      :value="value"
      class="form-control"
      :class="{ 'is-invalid input-invalid': !isValid }"
      @input="validateValue($event.target.value)"
    >
    <textarea
      v-else
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
      } else if (this.type === 'email') {
        this.validateValueAsEmail(value);
      } else if (this.type === 'url') {
        this.validateValueAsUrl(value);
      } else if (this.type === 'date') {
        this.validateValueAsDate(value);
      }
      this.$emit('input', value);
    },
    validateValueAsNumber (value) {
      this.isValid = !Number.isNaN(value);
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
    validateValueAsEmail (value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.isValid = emailPattern.test(value);
    },
    validateValueAsUrl (value) {
      try {
        this.isValid = Boolean(new URL(value));
      } catch (e) {
        this.isValid = false;
      }
    },
    validateValueAsDate (value) {
      this.isValid = !Number.isNaN(Date.parse(value));
    },
  },
};
</script>
